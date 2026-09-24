import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface DropdownOption {
  value: string
  label: string
  dotColor?: string
  badge?: string
  icon?: React.ElementType
}

interface CustomDropdownProps {
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  placeholder?: string
  className?: string
  menuClassName?: string
}

export default function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
  menuClassName = '',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Find currently selected option
  const selectedOption = options.find((opt) => opt.value === value)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#C49563] hover:bg-[#B6814C] border rounded-xl px-3 py-1.5 text-xs text-[#2B1405] font-bold outline-none cursor-pointer flex items-center justify-between gap-2.5 transition-all shadow-2xs select-none ${
          isOpen
            ? 'border-[#6E3812] ring-2 ring-[#8D4E22] bg-[#B6814C]'
            : 'border-[#8D4E22] hover:border-[#6E3812]'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.dotColor && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0 shadow-xs"
              style={{ backgroundColor: selectedOption.dotColor }}
            />
          )}
          {selectedOption?.icon && (
            <selectedOption.icon className="w-3.5 h-3.5 flex-shrink-0 text-[#8D4E22]" />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[#8D4E22] stroke-[2.5] flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown Card */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 z-50 min-w-full w-max max-w-xs bg-white border-2 border-[#8D4E22] rounded-2xl p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 space-y-1 ${menuClassName}`}
        >
          {options.map((option) => {
            const isSelected = option.value === value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#8D4E22] text-white shadow-xs'
                    : 'text-[#18221B] hover:bg-[#C49563] hover:text-[#2B1405]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {option.dotColor && (
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 shadow-xs ${
                        isSelected ? 'ring-1 ring-white/60' : ''
                      }`}
                      style={{ backgroundColor: option.dotColor }}
                    />
                  )}
                  {option.icon && (
                    <option.icon
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        isSelected ? 'text-white' : 'text-[#8D4E22]'
                      }`}
                    />
                  )}
                  <span className="truncate">{option.label}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {option.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#C49563] text-[#2B1405] border border-[#8D4E22]'
                      }`}
                    >
                      {option.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
