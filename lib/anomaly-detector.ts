export class AnomalyDetector {
  detectAnomalies(current, previous) {
    const anomalies = []

    if (!current || !current.timestamp) {
      return anomalies
    }

    // Temperature anomalies
    if (current.cell_temp > 60) {
      anomalies.push({
        type: "temperature",
        severity: "critical",
        reason: `Critical temperature: ${current.cell_temp}°C`,
        message: "Temperature exceeds safe operating limits",
      })
    } else if (current.cell_temp > 50) {
      anomalies.push({
        type: "temperature",
        severity: "high",
        reason: `High temperature: ${current.cell_temp}°C`,
        message: "Temperature is elevated",
      })
    }

    // Battery level anomalies
    if (current.kwh < 10 && current.is_battery === 1) {
      anomalies.push({
        type: "battery",
        severity: "critical",
        reason: `Critical battery level: ${current.kwh}%`,
        message: "Battery level is critically low",
      })
    } else if (current.kwh < 20 && current.is_battery === 1) {
      anomalies.push({
        type: "battery",
        severity: "high",
        reason: `Low battery level: ${current.kwh}%`,
        message: "Battery level is low",
      })
    }

    // Voltage anomalies
    if (current.v < 100 && current.is_battery === 1) {
      anomalies.push({
        type: "voltage",
        severity: "high",
        reason: `Low voltage: ${current.v}V`,
        message: "Voltage is below normal operating range",
      })
    }

    // Communication anomalies
    if (current.communication === 0) {
      anomalies.push({
        type: "communication",
        severity: "high",
        reason: "Communication lost",
        message: "Cabinet is not responding to communication",
      })
    }

    // Charging anomalies
    if (current.charger_online === 0) {
      anomalies.push({
        type: "charging",
        severity: "medium",
        reason: "Charger offline",
        message: "Charger is offline",
      })
    }

    // Charging anomalies
    if (current.is_battery === 1 && current.kwh < 80 && current.charger_online === 0) {
      anomalies.push({
        type: "charging",
        severity: "medium",
        reason: "Not charging when battery low",
        message: "Battery needs charging but charger is offline",
      })
    }

    // Door anomalies
    if (current.door === 1 && current.is_battery === 1 && current.kwh != 100) {
      anomalies.push({
        type: "security",
        severity: "medium",
        reason: "Door open with half charged battery present",
        message: "Security concern: door is open",
      })
    }

    // Fire safety anomalies
    if (current.out_fire === 1) {
      anomalies.push({
        type: "fire",
        severity: "critical",
        reason: "Fire safety alert",
        message: "Fire suppression system activated",
      })
    }

    // Voltage variance anomalies (loose connection detection)
    if (current.single_vol) {
      const voltageValues = current.single_vol
        .split(",")
        .map((v) => Number.parseFloat(v.trim()))
        .filter((v) => !isNaN(v))

      if (voltageValues.length > 1) {
        const variance = Math.max(...voltageValues) - Math.min(...voltageValues)
        if (variance > 0.5) {
          anomalies.push({
            type: "connection",
            severity: variance > 1.0 ? "high" : "medium",
            reason: `High voltage variance: ${variance.toFixed(2)}V`,
            message: "Possible loose connection detected",
          })
        }
      }
    }

    // Comparative anomalies (if previous data exists)
    if (previous && previous.timestamp) {
      // Sudden temperature change
      const tempDiff = Math.abs(current.cell_temp - previous.cell_temp)
      if (tempDiff > 10 && previous.is_battery  === current.is_battery) {
        anomalies.push({
          type: "temperature",
          severity: "medium",
          reason: `Sudden temperature change: ${tempDiff}°C`,
          message: "Rapid temperature fluctuation detected",
        })
      }

      // Sudden battery level drop
      const batteryDiff = previous.kwh - current.kwh
      if (batteryDiff > 20 && current.is_battery === 1) {
        anomalies.push({
          type: "battery",
          severity: "high",
          reason: `Rapid battery drain: ${batteryDiff}%`,
          message: "Battery level dropped significantly",
        })
      }

      // Voltage instability
      const voltageDiff = Math.abs(current.v - previous.v)
      if (voltageDiff > 50 && previous.is_battery === current.is_battery) {
        anomalies.push({
          type: "voltage",
          severity: "medium",
          reason: `Voltage instability: ${voltageDiff}V change`,
          message: "Voltage fluctuation detected",
        })
      }
    }

    return anomalies
  }

  getCabinetStatus(cabinet, previous) {
    const anomalies = this.detectAnomalies(cabinet, previous)

    if (!cabinet.timestamp) {
      return {
        status: "offline",
        bgClass: "bg-slate-800/50",
        borderClass: "border-slate-600",
        glow: "",
      }
    }

    // Critical anomalies
    const criticalAnomalies = anomalies.filter((a) => a.severity === "critical")
    if (criticalAnomalies.length > 0) {
      return {
        status: "critical",
        bgClass: "bg-red-900/20",
        borderClass: "border-red-500",
        glow: "shadow-red-500/20 shadow-lg",
      }
    }

    // High severity anomalies
    const highAnomalies = anomalies.filter((a) => a.severity === "high")
    if (highAnomalies.length > 0) {
      return {
        status: "warning",
        bgClass: "bg-orange-900/20",
        borderClass: "border-orange-500",
        glow: "shadow-orange-500/20 shadow-lg",
      }
    }

    // Medium severity anomalies
    const mediumAnomalies = anomalies.filter((a) => a.severity === "medium")
    if (mediumAnomalies.length > 0) {
      return {
        status: "caution",
        bgClass: "bg-yellow-900/20",
        borderClass: "border-yellow-500",
        glow: "",
      }
    }

    // Charging status
    if (cabinet.charger_online === 1 && cabinet.is_battery === 1) {
      return {
        status: "charging",
        bgClass: "bg-green-900/20",
        borderClass: "border-green-500",
        glow: "shadow-green-500/20 shadow-lg",
      }
    }

    // Normal operation
    if (cabinet.is_battery === 1 && cabinet.communication === 1) {
      return {
        status: "normal",
        bgClass: "bg-blue-900/20",
        borderClass: "border-blue-500",
        glow: "",
      }
    }

    // Empty cabinet
    if (cabinet.is_battery === 0) {
      return {
        status: "empty",
        bgClass: "bg-slate-800/50",
        borderClass: "border-slate-500",
        glow: "",
      }
    }

    // Default
    return {
      status: "unknown",
      bgClass: "bg-slate-800/50",
      borderClass: "border-slate-600",
      glow: "",
    }
  }
}
