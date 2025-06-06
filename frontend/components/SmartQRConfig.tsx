import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface SmartRule {
  type: 'location' | 'time' | 'device' | 'language';
  condition: any;
  content: string;
}

interface TimeWindow {
  start: string;
  end: string;
  days: number[];
}

interface SmartQRConfigProps {
  onSave: (config: {
    rules: SmartRule[];
    schedule?: {
      startDate?: Date;
      endDate?: Date;
      timeWindows?: TimeWindow[];
    };
    languages?: Record<string, string>;
    abTest?: {
      variantA: string;
      variantB: string;
    };
  }) => void;
}

export const SmartQRConfig: React.FC<SmartQRConfigProps> = ({ onSave }) => {
  const [rules, setRules] = useState<SmartRule[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([]);
  const [languages, setLanguages] = useState<Record<string, string>>({});
  const [abTest, setABTest] = useState<{ variantA: string; variantB: string }>({
    variantA: '',
    variantB: ''
  });

  const addRule = () => {
    setRules([
      ...rules,
      {
        type: 'location',
        condition: {},
        content: ''
      }
    ]);
  };

  const updateRule = (index: number, updates: Partial<SmartRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    setRules(newRules);
  };

  const addTimeWindow = () => {
    setTimeWindows([
      ...timeWindows,
      {
        start: '09:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5] // Monday to Friday
      }
    ]);
  };

  const addLanguage = () => {
    const code = prompt('Enter language code (e.g., en, es, fr):');
    if (code) {
      setLanguages({
        ...languages,
        [code]: ''
      });
    }
  };

  const handleSave = () => {
    onSave({
      rules,
      schedule: {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        timeWindows: timeWindows.length > 0 ? timeWindows : undefined
      },
      languages: Object.keys(languages).length > 0 ? languages : undefined,
      abTest: abTest.variantA && abTest.variantB ? abTest : undefined
    });
  };

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Smart Rules</h3>
        {rules.map((rule, index) => (
          <div key={index} className="space-y-2 p-4 border rounded">
            <select
              value={rule.type}
              onChange={(e) => updateRule(index, { type: e.target.value as SmartRule['type'] })}
              className="w-full p-2 border rounded"
            >
              <option value="location">Location</option>
              <option value="time">Time</option>
              <option value="device">Device</option>
              <option value="language">Language</option>
            </select>
            {rule.type === 'location' && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Country"
                  value={rule.condition.country || ''}
                  onChange={(e) =>
                    updateRule(index, {
                      condition: { ...rule.condition, country: e.target.value }
                    })
                  }
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={rule.condition.city || ''}
                  onChange={(e) =>
                    updateRule(index, {
                      condition: { ...rule.condition, city: e.target.value }
                    })
                  }
                  className="p-2 border rounded"
                />
              </div>
            )}
            <textarea
              placeholder="Content"
              value={rule.content}
              onChange={(e) => updateRule(index, { content: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
        ))}
        <button
          onClick={addRule}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Add Rule
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Schedule</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        {timeWindows.map((window, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded">
            <input
              type="time"
              value={window.start}
              onChange={(e) => {
                const newWindows = [...timeWindows];
                newWindows[index] = { ...window, start: e.target.value };
                setTimeWindows(newWindows);
              }}
              className="p-2 border rounded"
            />
            <input
              type="time"
              value={window.end}
              onChange={(e) => {
                const newWindows = [...timeWindows];
                newWindows[index] = { ...window, end: e.target.value };
                setTimeWindows(newWindows);
              }}
              className="p-2 border rounded"
            />
          </div>
        ))}
        <button
          onClick={addTimeWindow}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Add Time Window
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Languages</h3>
        {Object.entries(languages).map(([code, content]) => (
          <div key={code} className="p-4 border rounded">
            <label className="block text-sm font-medium mb-1">{code}</label>
            <textarea
              value={content}
              onChange={(e) => setLanguages({ ...languages, [code]: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
        ))}
        <button
          onClick={addLanguage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Add Language
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">A/B Testing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Variant A</label>
            <textarea
              value={abTest.variantA}
              onChange={(e) => setABTest({ ...abTest, variantA: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Variant B</label>
            <textarea
              value={abTest.variantB}
              onChange={(e) => setABTest({ ...abTest, variantB: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
      >
        Save Configuration
      </button>
    </div>
  );
}; 