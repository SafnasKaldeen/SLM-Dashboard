import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RecentSalesTableProps {
  recentSales: Array<{
    id: string;
    dateOfSale: string;
    bikeModel: string;
    customerType: string;
    locationCity: string;
    onroadPrice: number;
    paymentMethod: string;
  }>;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const RecentSalesTable = ({ recentSales }: RecentSalesTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

  // Calculate pagination
  const totalRecords = recentSales.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = recentSales.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <Card className="border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Sales Records</CardTitle>
        <CardDescription className="text-slate-400">
          Total sales transactions ({totalRecords} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400">Date</th>
                <th className="text-left py-3 px-4 text-slate-400">Model</th>
                <th className="text-left py-3 px-4 text-slate-400">Customer</th>
                <th className="text-left py-3 px-4 text-slate-400">City</th>
                <th className="text-left py-3 px-4 text-slate-400">Amount</th>
                <th className="text-left py-3 px-4 text-slate-400">Payment</th>
                <th className="text-left py-3 px-4 text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-300">
                    {new Date(sale.dateOfSale).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{sale.bikeModel}</td>
                  <td className="py-3 px-4 text-slate-300">
                    {sale.customerType}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {sale.locationCity}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {formatCurrency(sale.onroadPrice)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        sale.paymentMethod === "cash" ? "default" : "secondary"
                      }
                      className="capitalize bg-slate-700/50 text-slate-300"
                    >
                      {sale.paymentMethod}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      Completed
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700">
            <div className="text-sm text-slate-400">
              Showing {startIndex + 1} to {Math.min(endIndex, totalRecords)} of{" "}
              {totalRecords} entries
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-1 text-sm bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-1 text-sm bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
