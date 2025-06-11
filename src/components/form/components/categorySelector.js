import React, { useState, useEffect } from "react";
import categoriesData from '../../../data/categoriesData';

function CategorySelector({ onChange }) {
  const [selectedPath, setSelectedPath] = useState([]);
  const [dropdownOptions, setDropdownOptions] = useState([]);
console.log(selectedPath)
  const getOptionsAtLevel = (level, path) => {
    if (level === 0) {
      return Object.values(categoriesData);
    }

    let currentLevelNodes = Object.values(categoriesData);
    for (let i = 0; i < level; i++) {
      const selectedValue = path[i];
      if (!selectedValue) return [];
      const foundNode = currentLevelNodes.find(node => node.value === selectedValue);
      if (!foundNode || !foundNode.child) return [];
      currentLevelNodes = foundNode.child;
    }
    return currentLevelNodes || [];
  };

  useEffect(() => {
    let options = [];
    let level = 0;

    while (true) {
      const opts = getOptionsAtLevel(level, selectedPath);
      if (!opts.length) break;
      options[level] = opts;

      const selectedValue = selectedPath[level];
      if (!selectedValue) break;
      const selectedNode = opts.find(opt => opt.value === selectedValue);
      if (!selectedNode || !selectedNode.child) break;

      level++;
    }

    setDropdownOptions(options);
  }, [selectedPath]);

  const handleChange = (level, value) => {
    const newPath = selectedPath.slice(0, level);
    if (value) {
      newPath[level] = value;
    }
    setSelectedPath(newPath);
    if (onChange) onChange(newPath); // om du vill skicka vidare vald path
  };

  // Visar vald kategori som text (kan användas i föräldrakomponent)
  const getSelectedCategoryText = (path) => {
    if (path.length === 0) return "Ingen kategori vald";

    let currentNode = categoriesData[path[0]];
    if (!currentNode) return "Ingen kategori vald";

    let labels = [currentNode.label];

    for (let i = 1; i < path.length; i++) {
      if (!currentNode.child) break;
      currentNode = currentNode.child.find(c => c.value === path[i]);
      if (!currentNode) break;
      labels.push(currentNode.label);
    }
    return labels.join(" > ");
  };

  return (
    <div>
      <div style={{display: 'flex', gap: '10px'}}>
      {dropdownOptions.map((options, level) => {
        const selectedValue = selectedPath[level] || "";
        return (
          <div key={level} style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.3rem" }}>
              {level === 0 ? "Huvudkategori:" : `Underkategori ${level + 1}:`}
            </label>
            <select
              value={selectedValue}
              onChange={(e) => handleChange(level, e.target.value)}
              style={{ width: "226px", fontSize: "16px", height: "30px" }}
            >
              <option value="">Välj...</option>
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );
      })}
      </div>
      <div style={{ marginTop: "1rem" }}>
        <strong>Vald kategori:</strong> {selectedPath.map(item => (<> <span>{ `${item} >`}</span></>))}
      </div>
    </div>
  );
}

export default CategorySelector;
