import React from "react";

const EventFilter = ({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, index) => currentYear - index); // For the last 10 years
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="mt-4 flex flex-col items-start">
      <div className="flex items-center gap-4">
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="rounded-lg border border-gray-300 p-2"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}
          className="rounded-lg border border-gray-300 p-2"
        >
          {months.map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default EventFilter;
