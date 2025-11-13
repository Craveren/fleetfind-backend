import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DollarSignIcon, ShoppingCartIcon, TagIcon, Percent, CalendarDays } from 'lucide-react';
import { fetchBookSales } from '../features/bookSalesSlice';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { convertToZAR, calculateVAT, addVAT, formatZAR } from '../utils/currency';
import { VAT_RATE } from '../utils/constants';

const BookSales = () => {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const language = useSelector((state) => state?.userPreferences?.preferences?.language_preference) || 'en-ZA';
  const { sales, status: salesStatus, error: salesError } = useSelector((state) => state.bookSales);

  const [startDateFilter, setStartDateFilter] = useState(null);
  const [endDateFilter, setEndDateFilter] = useState(null);
  const [platformFilter, setPlatformFilter] = useState('All');

  useEffect(() => {
    if (currentWorkspace?.id) {
      const queryParams = {
        workspace_id: currentWorkspace.id,
        ...(platformFilter !== 'All' && { platform: platformFilter }),
        ...(startDateFilter && { start_date: format(startDateFilter, 'yyyy-MM-dd') }),
        ...(endDateFilter && { end_date: format(endDateFilter, 'yyyy-MM-dd') }),
      };
      dispatch(fetchBookSales(queryParams));
    }
  }, [dispatch, currentWorkspace?.id, platformFilter, startDateFilter, endDateFilter]);

  const totalRevenueZAR = sales.reduce((sum, sale) => sum + parseFloat(sale.revenue_zar), 0);
  const totalVATAmount = calculateVAT(totalRevenueZAR);
  const totalRevenueZARInclVAT = addVAT(totalRevenueZAR);
  const totalUnitsSold = sales.reduce((sum, sale) => sum + sale.units, 0);
  const averagePriceZAR = totalUnitsSold > 0 ? (totalRevenueZAR / totalUnitsSold).toFixed(2) : '0.00';

  if (salesStatus === 'loading' || !currentWorkspace) {
    return <div className="p-6 text-center text-gray-500 dark:text-zinc-400">Loading book sales data...</div>;
  }

  if (salesStatus === 'failed') {
    return <div className="p-6 text-center text-red-500">Error: {salesError}</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Book Sales</h1>
      <p className="text-gray-500 dark:text-zinc-400 text-sm">Integrate Amazon/Takealot sales reports here.</p>

      {/* Sales Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border p-5 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800 flex items-center gap-4">
          <DollarSignIcon className="size-6 text-green-500" />
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Revenue (Excl. VAT)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatZAR(totalRevenueZAR, language)}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">Incl. VAT: {formatZAR(parseFloat(totalRevenueZARInclVAT), language)}</p>
          </div>
        </div>
        <div className="rounded-lg border p-5 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800 flex items-center gap-4">
          <ShoppingCartIcon className="size-6 text-blue-500" />
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Units Sold</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUnitsSold}</p>
          </div>
        </div>
        <div className="rounded-lg border p-5 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800 flex items-center gap-4">
          <TagIcon className="size-6 text-purple-500" />
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Avg. Price Per Unit (Excl. VAT)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatZAR(parseFloat(averagePriceZAR), language)}</p>
          </div>
        </div>
        <div className="rounded-lg border p-5 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800 flex items-center gap-4">
          <Percent className="size-6 text-orange-500" />
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Total VAT (15%)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatZAR(parseFloat(totalVATAmount), language)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative w-full">
          <DatePicker
            selected={startDateFilter}
            onChange={(date) => setStartDateFilter(date)}
            selectsStart
            startDate={startDateFilter}
            endDate={endDateFilter}
            placeholderText="Start Date"
            className="w-full p-2 pl-10 rounded-md border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            dateFormat="yyyy-MM-dd"
          />
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4" />
        </div>
        <div className="relative w-full">
          <DatePicker
            selected={endDateFilter}
            onChange={(date) => setEndDateFilter(date)}
            selectsEnd
            startDate={startDateFilter}
            endDate={endDateFilter}
            minDate={startDateFilter}
            placeholderText="End Date"
            className="w-full p-2 pl-10 rounded-md border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            dateFormat="yyyy-MM-dd"
          />
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4" />
        </div>
        <select onChange={(e) => setPlatformFilter(e.target.value)} value={platformFilter} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm">
          <option value="All">All Platforms</option>
          <option value="Amazon">Amazon</option>
          <option value="Takealot">Takealot</option>
          {/* Add more platforms as needed */}
        </select>
      </div>

      {/* Recent Sales Data */}
      <div className="rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Sales Data</h2>
        {sales.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No recent sales data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
              <thead className="bg-gray-50 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Book</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Revenue (Excl. VAT)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Units</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{sale.book_id}</td> {/* Assuming book_id can be displayed or mapped to bookName */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">{sale.platform}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">{formatZAR(parseFloat(sale.revenue_zar), language)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">{sale.units}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">{sale.sale_date ? format(new Date(sale.sale_date), 'PPP') : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSales;
