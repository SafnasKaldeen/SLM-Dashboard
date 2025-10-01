"use client";

import { useState, useEffect } from "react";
import { Group } from "@visx/group";
import { Bar } from "@visx/shape";
import { scaleBand, scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Tooltip, useTooltip, defaultStyles } from "@visx/tooltip";

interface SessionRow {
  sessionId: string;
  bmsId: string;
  startTime: string;
  endTime: string;
  status: string;
  duration: string;
}

interface ChartData {
  date: string;
  _sessions?: SessionRow[];
}

export default function BMSStackedVisX() {
  const [data, setData] = useState<ChartData[]>([]);
  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<ChartData>();

  const width = 900;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 100, left: 60 };

  useEffect(() => {
    const s: SessionRow[] = [
      {
        sessionId: "9703",
        bmsId: "BT106003012MT00230883391",
        startTime: "Jul 31, 06:48 AM",
        endTime: "Jul 31, 07:11 AM",
        duration: "23m",
        status: "Active",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Jul 31, 07:11 AM",
        endTime: "Aug 1, 12:00 AM",
        duration: "16h 48m",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 1, 12:00 AM",
        endTime: "Aug 1, 04:03 AM",
        duration: "4h 3m",
        status: "Unavailable",
      },
      {
        sessionId: "8544",
        bmsId: "No BMS",
        startTime: "Aug 1, 04:03 AM",
        endTime: "Aug 1, 05:30 AM",
        duration: "1h 27m",
        status: "Active",
      },
      {
        sessionId: "8544",
        bmsId: "No BMS",
        startTime: "Aug 1, 05:30 AM",
        endTime: "Aug 1, 05:30 AM",
        duration: "27s",
        status: "Active",
      },
      {
        sessionId: "8545",
        bmsId: "BT106003012MT00230883180",
        startTime: "Aug 1, 05:34 AM",
        endTime: "Aug 1, 12:06 PM",
        duration: "6h 32m",
        status: "Active",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 1, 12:06 PM",
        endTime: "Aug 2, 12:00 AM",
        duration: "11h 54m",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 2, 12:00 AM",
        endTime: "Aug 2, 05:30 AM",
        duration: "5h 30m",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 2, 05:30 AM",
        endTime: "Aug 3, 05:30 AM",
        duration: "24h",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 3, 05:30 AM",
        endTime: "Aug 4, 04:33 AM",
        duration: "23h 4m",
        status: "Unavailable",
      },
      {
        sessionId: "8546",
        bmsId: "BT106003012MT00230883180",
        startTime: "Aug 4, 04:33 AM",
        endTime: "Aug 4, 05:30 AM",
        duration: "56m",
        status: "Active",
      },
      {
        sessionId: "8546",
        bmsId: "BT106003012MT00230883180",
        startTime: "Aug 4, 05:30 AM",
        endTime: "Aug 4, 11:59 PM",
        duration: "18h 29m",
        status: "Active",
      },
      {
        sessionId: "8547",
        bmsId: "BT106003012MT00230883180",
        startTime: "Aug 5, 12:00 AM",
        endTime: "Aug 5, 05:30 AM",
        duration: "5h 30m",
        status: "Active",
      },
      {
        sessionId: "8547",
        bmsId: "BT106003012MT00230883180",
        startTime: "Aug 5, 05:30 AM",
        endTime: "Aug 5, 10:37 AM",
        duration: "5h 8m",
        status: "Active",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 5, 10:37 AM",
        endTime: "Aug 6, 12:00 AM",
        duration: "13h 23m",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 6, 12:00 AM",
        endTime: "Aug 6, 05:30 AM",
        duration: "5h 30m",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 6, 05:30 AM",
        endTime: "Aug 7, 05:30 AM",
        duration: "24h",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 7, 05:30 AM",
        endTime: "Aug 7, 05:35 AM",
        duration: "6m",
        status: "Unavailable",
      },
      {
        sessionId: "8548",
        bmsId: "BT106003012MT00230883180",
        startTime: "Aug 7, 05:35 AM",
        endTime: "Aug 7, 11:56 AM",
        duration: "6h 20m",
        status: "Active",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 7, 11:56 AM",
        endTime: "Aug 8, 12:00 AM",
        duration: "12h 4m",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 8, 12:00 AM",
        endTime: "Aug 8, 05:30 AM",
        duration: "5h 30m",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 8, 05:30 AM",
        endTime: "Aug 9, 05:30 AM",
        duration: "24h",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 9, 05:30 AM",
        endTime: "Aug 10, 05:30 AM",
        duration: "24h",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 10, 05:30 AM",
        endTime: "Aug 11, 05:30 AM",
        duration: "24h",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 11, 05:30 AM",
        endTime: "Aug 12, 03:21 AM",
        duration: "21h 52m",
        status: "Unavailable",
      },
      {
        sessionId: "8549",
        bmsId: "BT106003012MT00230883180",
        startTime: "Aug 12, 03:21 AM",
        endTime: "Aug 12, 05:30 AM",
        duration: "2h 8m",
        status: "Active",
      },
      {
        sessionId: "8549",
        bmsId: "BT106003012MT00230883180",
        startTime: "Aug 12, 05:30 AM",
        endTime: "Aug 12, 11:20 AM",
        duration: "5h 50m",
        status: "Active",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 12, 11:20 AM",
        endTime: "Aug 13, 12:00 AM",
        duration: "12h 40m",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 13, 12:00 AM",
        endTime: "Aug 13, 03:40 AM",
        duration: "3h 40m",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 13, 03:40 AM",
        endTime: "Aug 13, 05:30 AM",
        duration: "1h 50m",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 13, 05:30 AM",
        endTime: "Aug 14, 12:00 AM",
        duration: "18h 30m",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 14, 12:00 AM",
        endTime: "Aug 14, 05:30 AM",
        duration: "5h 30m",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 14, 05:30 AM",
        endTime: "Aug 15, 05:30 AM",
        duration: "24h",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 15, 05:30 AM",
        endTime: "Aug 16, 05:30 AM",
        duration: "24h",
        status: "Unavailable",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 16, 05:30 AM",
        endTime: "Aug 16, 09:02 AM",
        duration: "3h 32m",
        status: "Unavailable",
      },
      {
        sessionId: "8551",
        bmsId: "BT106003012MT00230883180",
        startTime: "Aug 16, 09:02 AM",
        endTime: "Aug 16, 11:54 AM",
        duration: "2h 53m",
        status: "Active",
      },
      {
        sessionId: "N/A",
        bmsId: "UNAVAILABLE",
        startTime: "Aug 16, 11:54 AM",
        endTime: "Aug 16, 12:06 PM",
        duration: "11m",
        status: "Unavailable",
      },
      {
        sessionId: "8552",
        bmsId: "No BMS",
        startTime: "Aug 16, 12:06 PM",
        endTime: "Aug 16, 12:22 PM",
        duration: "16m",
        status: "Active",
      },
      {
        sessionId: "8553",
        bmsId: "BT106003012MT00221017858",
        startTime: "Aug 16, 12:22 PM",
        endTime: "Aug 16, 11:59 PM",
        duration: "11h 37m",
        status: "Active",
      },
      {
        sessionId: "8554",
        bmsId: "BT106003012MT00221017858",
        startTime: "Aug 17, 12:00 AM",
        endTime: "Aug 17, 05:30 AM",
        duration: "5h 30m",
        status: "Active",
      },
      {
        sessionId: "8554",
        bmsId: "BT106003012MT00221017858",
        startTime: "Aug 17, 05:30 AM",
        endTime: "Aug 17, 11:59 PM",
        duration: "18h 30m",
        status: "Active",
      },
    ];

    // Group sessions by date
    const sessionsByDate: Record<string, ChartData> = {};
    s.forEach((sess) => {
      const start = new Date(sess.startTime);
      const dateKey = start.toISOString().split("T")[0];
      if (!sessionsByDate[dateKey])
        sessionsByDate[dateKey] = { date: dateKey, _sessions: [] };
      sessionsByDate[dateKey]._sessions?.push(sess);
    });

    // Sort sessions chronologically for each day
    Object.values(sessionsByDate).forEach((day) => {
      day._sessions?.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });

    setData(Object.values(sessionsByDate));
  }, []);

  // Generate BMS colors
  const distinctBms = Array.from(
    new Set(data.flatMap((d) => d._sessions?.map((s) => s.bmsId) || []))
  );
  const bmsColors: Record<string, string> = {};
  distinctBms.forEach((bms, idx) => {
    if (bms === "UNAVAILABLE") bmsColors[bms] = "#000000";
    else if (bms === "No BMS") bmsColors[bms] = "#9ca3af"; // gray
    else bmsColors[bms] = `hsl(${(idx * 60) % 360}, 70%, 50%)`;
  });

  const xScale = scaleBand<string>({
    domain: data.map((d) => d.date),
    range: [margin.left, width - margin.right],
    padding: 0.3,
  });

  const maxTotalHours = Math.max(
    ...data.map(
      (d) =>
        d._sessions?.reduce((sum, s) => {
          const start = new Date(s.startTime);
          const end = new Date(s.endTime);
          return sum + (end.getTime() - start.getTime()) / 1000 / 60 / 60;
        }, 0) || 0
    )
  );

  const yScale = scaleLinear({
    domain: [0, maxTotalHours],
    range: [height - margin.bottom, margin.top],
  });

  return (
    <div style={{ position: "relative" }}>
      <svg width={width} height={height}>
        <AxisBottom
          top={height - margin.bottom}
          scale={xScale}
          tickLabelProps={() => ({
            fontSize: 12,
            textAnchor: "end",
            dy: 10,
            angle: -45,
          })}
        />
        <AxisLeft
          left={margin.left}
          scale={yScale}
          tickFormat={(v) => `${v}h`}
        />

        {data.map((day) => {
          let cumulative = 0; // stack start
          return (
            <Group key={day.date} left={xScale(day.date)}>
              {day._sessions?.map((sess, idx) => {
                const start = new Date(sess.startTime);
                const end = new Date(sess.endTime);
                const durationHours =
                  (end.getTime() - start.getTime()) / 1000 / 60 / 60;
                const barHeight = yScale(0) - yScale(durationHours);
                const y = yScale(durationHours + cumulative);
                cumulative += durationHours;

                return (
                  <Bar
                    key={`${sess.sessionId}-${idx}`}
                    x={0}
                    y={y}
                    width={xScale.bandwidth()}
                    height={barHeight}
                    fill={bmsColors[sess.bmsId] || "#64748b"}
                    onMouseMove={(e) =>
                      showTooltip({
                        tooltipData: { day, sess, cumulative },
                        tooltipLeft: e.clientX,
                        tooltipTop: e.clientY,
                      })
                    }
                    onMouseLeave={hideTooltip}
                  />
                );
              })}
            </Group>
          );
        })}
      </svg>

      {tooltipData && (
        <Tooltip top={tooltipTop} left={tooltipLeft} style={defaultStyles}>
          <div className="text-xs font-bold">{tooltipData.sess.bmsId}</div>
          <div>Start: {tooltipData.sess.startTime}</div>
          <div>End: {tooltipData.sess.endTime}</div>
          <div>
            Duration:{" "}
            {(
              (new Date(tooltipData.sess.endTime).getTime() -
                new Date(tooltipData.sess.startTime).getTime()) /
              1000 /
              60 /
              60
            ).toFixed(2)}{" "}
            h
          </div>
          <div>
            Total for day:{" "}
            {tooltipData.day._sessions
              ?.reduce((sum, s) => {
                const start = new Date(s.startTime);
                const end = new Date(s.endTime);
                return sum + (end.getTime() - start.getTime()) / 1000 / 60 / 60;
              }, 0)
              .toFixed(2)}
            h
          </div>
        </Tooltip>
      )}

      {/* Table below chart */}
      <table className="min-w-full border border-gray-300 mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1 text-left">Date</th>
            <th className="border px-2 py-1 text-left">BMS</th>
            <th className="border px-2 py-1 text-left">Status</th>
            <th className="border px-2 py-1 text-left">Start Time</th>
            <th className="border px-2 py-1 text-left">End Time</th>
            <th className="border px-2 py-1 text-left">Duration (h)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((day) =>
            day._sessions?.map((sess, idx) => {
              const start = new Date(sess.startTime);
              const end = new Date(sess.endTime);
              const durationHours = (
                (end.getTime() - start.getTime()) /
                1000 /
                60 /
                60
              ).toFixed(2);

              return (
                <tr key={`${day.date}-${idx}`} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">{day.date}</td>
                  <td className="border px-2 py-1">{sess.bmsId}</td>
                  <td className="border px-2 py-1">{sess.status}</td>
                  <td className="border px-2 py-1">{sess.startTime}</td>
                  <td className="border px-2 py-1">{sess.endTime}</td>
                  <td className="border px-2 py-1">{durationHours}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
