import React, { useState } from 'react';

const ExtraProductInfo = () => {
  const [showExtra, setShowExtra] = useState(false);
  const [info, setInfo] = useState('');
  const [salesOption, setSalesOption] = useState('direct');

  return (
    <div className="space-y-4">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={showExtra}
          onChange={() => setShowExtra(!showExtra)}
        />
        <span>Visa ytterligare produktinställningar</span>
      </label>

      {showExtra && (
        <div className="space-y-4 bg-gray-100 p-4 rounded-lg">
          <div>
            <label className="block mb-1 text-sm font-medium">Info</label>
            <input
              type="text"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              placeholder="Ange extra information"
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Försäljningsalternativ</label>
            <select
              value={salesOption}
              onChange={(e) => setSalesOption(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="direct">Sälj direkt</option>
              <option value="offer">Baka in i offert</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtraProductInfo;
