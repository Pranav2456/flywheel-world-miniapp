'use client';

import { useState } from 'react';

export type SupportedMiniApp = 'morpho' | 'aave' | 'uniswap' | 'others';

interface MiniAppPickerProps {
  defaultValue?: SupportedMiniApp;
  onChange?: (miniApp: SupportedMiniApp) => void;
}

export const MiniAppPicker = ({
  defaultValue = 'morpho',
  onChange,
}: MiniAppPickerProps) => {
  const [selected, setSelected] = useState<SupportedMiniApp>(defaultValue);

  const handleChange = (value: SupportedMiniApp) => {
    // Only "morpho" is available in this demo; others are coming soon
    if (value !== 'morpho') {
      // Keep selection on morpho but let user see options
      setSelected('morpho');
      onChange?.('morpho');
      return;
    }
    setSelected(value);
    onChange?.(value);
  };

  return (
    <section className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm w-full">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold">Choose your mini app</p>
      </div>
      <div className="grid gap-2">
        <label htmlFor="miniapp" className="text-xs text-gray-600">
          Choose where you want the magic to happen
        </label>
        <select
          id="miniapp"
          value={selected}
          onChange={(e) => handleChange(e.target.value as SupportedMiniApp)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="morpho">Morpho </option>
          <option value="aave" disabled>
            UNO (Coming soon)
          </option>
          <option value="uniswap" disabled>
            DropWallet (Coming soon)
          </option>
          <option value="others" disabled>
            More mini apps soon
          </option>
        </select>
        <p className="text-xs text-gray-500">
          Starting with Morpho. More integrations land here as we ship.
        </p>
      </div>
    </section>
  );
};


