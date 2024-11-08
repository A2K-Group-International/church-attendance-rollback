import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

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
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger>
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
            </Tooltip.Trigger>
            <Tooltip.Content
              side="right"
              className="rounded-md bg-gray-800 p-2 text-white shadow-lg"
            >
              Select a year
              <Tooltip.Arrow />
            </Tooltip.Content>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger>
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
            </Tooltip.Trigger>
            <Tooltip.Content
              side="right"
              className="rounded-md bg-gray-800 p-2 text-white shadow-lg"
            >
              Select a month
              <Tooltip.Arrow />
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
    </div>
  );
};

export default EventFilter;
