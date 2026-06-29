import React, { useState, useRef, useEffect } from 'react';
import { DateRangePicker, createStaticRanges } from 'react-date-range';
import { subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';
import './DateFilter.css';

const customStaticRanges = createStaticRanges([
  {
    label: 'Hôm nay',
    range: () => ({ startDate: new Date(), endDate: new Date() })
  },
  {
    label: 'Hôm qua',
    range: () => ({ startDate: subDays(new Date(), 1), endDate: subDays(new Date(), 1) })
  },
  {
    label: '7 ngày qua',
    range: () => ({ startDate: subDays(new Date(), 6), endDate: new Date() })
  },
  {
    label: '30 ngày qua',
    range: () => ({ startDate: subDays(new Date(), 29), endDate: new Date() })
  },
  {
    label: 'Tháng này',
    range: () => ({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) })
  },
  {
    label: 'Tháng trước',
    range: () => ({ startDate: startOfMonth(subMonths(new Date(), 1)), endDate: endOfMonth(subMonths(new Date(), 1)) })
  },
  {
    label: 'Tất cả (Từ trước tới nay)',
    range: () => ({ startDate: new Date('2020-01-01'), endDate: new Date() })
  }
]);

export default function DateFilter({ dateRange, setDateRange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const formatDateStr = (date) => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isAllTime = dateRange[0].startDate.getTime() === new Date('2020-01-01').getTime();

  return (
    <div className="date-filter-container" ref={ref}>
      <button className={`date-filter-btn ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <CalendarIcon size={16} />
        <span>
          {isAllTime 
            ? 'Từ trước tới nay' 
            : `${formatDateStr(dateRange[0].startDate)} - ${formatDateStr(dateRange[0].endDate)}`}
        </span>
        <ChevronDown size={14} style={{marginLeft: '4px', opacity: 0.6}} />
      </button>

      {isOpen && (
        <div className="date-filter-popover">
          <DateRangePicker
            onChange={handleSelect}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            months={2}
            ranges={dateRange}
            direction="horizontal"
            locale={vi}
            staticRanges={customStaticRanges}
            inputRanges={[]}
          />
        </div>
      )}
    </div>
  );
}
