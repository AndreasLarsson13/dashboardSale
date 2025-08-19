// src/components/form/components/CategorySelector.jsx (eller var din fil nu ligger)

import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';

/* import categoriesData from '../../../data/categoriesData'; // Se till att sökvägen är korrekt
 */import { fetchCategoryData } from '../../../data/categoryFetch';
// Den här komponenten hanterar EN ENSKILD KATEGORIVÄG
// Den tar emot den valda sökvägen som en platt array av strängar
// Och skickar ut den uppdaterade sökvägen som en platt array av strängar
function CategorySelector({ selectedPath = [], onChange }) { // selectedPath är nu standardiserat till en platt array
 const [categoriesData, setCategoriesData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/menu`); // Axios automatically parses JSON
        setCategoriesData(res.data); // `res.data` contains the parsed JSON
        console.log(res.data);
      } catch (error) {
        console.error('Failed to fetch menu', error);
      }
    };

    fetchData();
  }, []);
  const [currentPathSegments, setCurrentPathSegments] = useState(selectedPath);
  const [dropdownOptions, setDropdownOptions] = useState([]);

  // Synkronisera internt state med prop när den ändras från föräldern
  useEffect(() => {
    // Använd JSON.stringify för en djup jämförelse av arrayer
    if (JSON.stringify(currentPathSegments) !== JSON.stringify(selectedPath)) {
      setCurrentPathSegments(selectedPath);
    }
  }, [selectedPath]); // Beroende på den inkommande prop:en

  // Hjälpfunktion för att hämta alternativ för en specifik nivå i kategoriträdet
  const getOptionsAtLevel = useCallback((level, pathSegments) => {
    if (level === 0) {
      return Object.values(categoriesData); // Toppnivå kategorier
    }

    let currentLevelNodes = Object.values(categoriesData);
    for (let i = 0; i < level; i++) {
      const selectedValue = pathSegments[i];
      if (!selectedValue) return []; // Inget valt på tidigare nivå, inga barnalternativ
const foundNode = currentLevelNodes.find(node => node.value === selectedValue);
      if (!foundNode || !foundNode.child) return []; // Nod hittades inte eller inga barn
      currentLevelNodes = foundNode.child;
    }
    return currentLevelNodes || []; // Returnera alternativ för aktuell nivå
  }, [categoriesData]); //categoriesData som beroende ifall den skulle kunna ändras

  // Effekt för att uppdatera dropdown-alternativen baserat på vald sökväg
  useEffect(() => {
    let options = [];
    let level = 0;

    // Bygg upp dropdown-alternativen dynamiskt för varje nivå
    while (true) {
      const opts = getOptionsAtLevel(level, currentPathSegments);
      if (!opts.length) break; // Inga fler alternativ på denna nivå
      options[level] = opts;

      const selectedValue = currentPathSegments[level];
      if (!selectedValue) break; // Användaren har inte valt på denna nivå än
      const selectedNode = opts.find(opt => opt.value === selectedValue);
      if (!selectedNode || !selectedNode.child) break; // Ingen nod hittades eller inga barn, avsluta

      level++;
    }
    setDropdownOptions(options);
  }, [currentPathSegments, getOptionsAtLevel]); // Beroende på interna sökvägen och getOptionsAtLevel

  // Hanterare när en dropdown ändras
  const handleChange = useCallback((level, value) => {
    // Skapa en ny sökvägs-array baserat på tidigare val upp till aktuell nivå
    const newPath = currentPathSegments.slice(0, level);

    if (value) {
      newPath[level] = value; // Lägg till det nya valet
    }
    // Uppdatera det interna statet
    setCurrentPathSegments(newPath);
    // Skicka den uppdaterade platta sökvägen till föräldern
    if (onChange) onChange(newPath);
  }, [currentPathSegments, onChange]);

  return (
    <div>
      <div style={{display: 'flex', gap: '10px'}}>
        {dropdownOptions.map((options, level) => {
          const selectedValue = currentPathSegments[level] || ""; // Vald kategori på denna nivå
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
        <strong>Vald kategori:</strong> {currentPathSegments.map((item, index) => (
          <span key={index}>
            {item}
            {index < currentPathSegments.length - 1 ? ' > ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

export default CategorySelector;