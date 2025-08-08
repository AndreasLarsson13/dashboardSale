import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [tree, setTree] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [expandedNodes, setExpandedNodes] = useState({});

  const [newLabel, setNewLabel] = useState('');
  const [newParent, setNewParent] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/menuAdmin`);
      setCategories(res.data);
      setTree(buildCategoryTree(res.data));
    } catch (err) {
      console.error('Kunde inte hämta kategorier', err);
    }
  };

  const buildCategoryTree = (categories) => {
    const map = {};
    const roots = [];

    categories.forEach(cat => {
      map[cat.value] = { ...cat, child: [] };
    });

    categories.forEach(cat => {
      if (cat.parent && map[cat.parent]) {
        map[cat.parent].child.push(map[cat.value]);
      } else {
        roots.push(map[cat.value]);
      }
    });

    return roots;
  };

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  const toggleExpand = (id) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const startEditing = (node) => {
    setEditingId(node._id);
    setEditLabel(node.label);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditLabel('');
  };

  const saveEdit = async (id) => {
    try {
      const label = editLabel.trim();
      const value = slugify(label);

      const exists = categories.some(
        cat => cat.value === value && cat._id !== id
      );

      if (exists) {
        alert('En annan kategori har redan detta slug (value).');
        return;
      }

      const res = await axios.put(`${process.env.REACT_APP_API_URL}/menuAdmin/${id}`, { label, value });

      const updated = categories.map(cat =>
        cat._id === id
          ? { ...cat, label, value }
          : cat.parent === categories.find(c => c._id === id)?.value
            ? { ...cat, parent: value }
            : cat
      );

      setCategories(updated);
      setTree(buildCategoryTree(updated));
      cancelEditing();
    } catch (error) {
      alert('Kunde inte uppdatera kategorin');
      console.error(error);
    }
  };

  const removeCategory = async (id) => {
    if (!window.confirm('Ta bort denna kategori och alla dess underkategorier?')) return;

    try {
      const idsToRemove = getAllChildIds(id, categories).concat(id);
      for (const removeId of idsToRemove) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/menuAdmin/${removeId}`);
      }

      const remaining = categories.filter(cat => !idsToRemove.includes(cat._id));
      setCategories(remaining);
      setTree(buildCategoryTree(remaining));
    } catch (error) {
      alert('Kunde inte ta bort kategori');
      console.error(error);
    }
  };

  const getAllChildIds = (parentId, categoriesList) => {
    const parent = categoriesList.find(p => p._id === parentId);
    if (!parent) return [];

    const directChildren = categoriesList.filter(
      cat => cat.parent === parent.value
    );

    let allChildren = [];
    directChildren.forEach(child => {
      allChildren.push(child._id);
      allChildren = allChildren.concat(getAllChildIds(child._id, categoriesList));
    });
    return allChildren;
  };

  const renderTree = (nodes, level = 0) =>
    nodes.map(node => (
      <div key={node._id} style={{ marginLeft: level * 20, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {node.child.length > 0 && (
            <button onClick={() => toggleExpand(node._id)} style={{ marginRight: 6 }}>
              {expandedNodes[node._id] ? '▼' : '▶'}
            </button>
          )}
          <div style={{ flexGrow: 1 }}>
            {editingId === node._id ? (
              <>
                <input
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  style={{ padding: '4px', fontSize: '1rem' }}
                />
                <button onClick={() => saveEdit(node._id)} style={{ marginLeft: 8 }}>Spara</button>
                <button onClick={cancelEditing} style={{ marginLeft: 4 }}>Avbryt</button>
              </>
            ) : (
              <>
                <strong>{node.label}</strong> <small style={{ color: '#666' }}>({node.value})</small>
              </>
            )}
          </div>
          {editingId !== node._id && (
            <>
              <button onClick={() => startEditing(node)} style={{ marginLeft: 8 }}>✏️</button>
              <button onClick={() => removeCategory(node._id)} style={{ marginLeft: 4, color: 'red' }}>🗑️</button>
            </>
          )}
        </div>
        {node.child.length > 0 && expandedNodes[node._id] && (
          <div style={{ width: '100%' }}>
            {renderTree(node.child, level + 1)}
          </div>
        )}
      </div>
    ));

  const handleAddCategory = async () => {
    if (!newLabel) {
      alert('Fyll i namn');
      return;
    }

    const newValue = slugify(newLabel);
    const alreadyExists = categories.some(cat => cat.value === newValue);
    if (alreadyExists) {
      alert('Slug (value) finns redan');
      return;
    }

    try {
      const body = {
        label: newLabel,
        value: newValue,
        parent: newParent || null,
      };

      const res = await axios.post(`${process.env.REACT_APP_API_URL}/menuAdmin`, body);
      const updated = [...categories, res.data];
      setCategories(updated);
      setTree(buildCategoryTree(updated));

      setNewLabel('');
      setNewParent('');
    } catch (error) {
      alert('Kunde inte lägga till kategori');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Kategorier</h2>
      {tree.length > 0 ? renderTree(tree) : <p>Inga kategorier att visa</p>}

      <hr style={{ margin: '20px 0' }} />
      <h3>➕ Lägg till ny kategori</h3>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 400 }}>
        <input
          placeholder="Namn (label)"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <select
          value={newParent}
          onChange={e => setNewParent(e.target.value)}
          style={{ marginBottom: 8 }}
        >
          <option value="">(Ingen förälder - toppnivå)</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <button onClick={handleAddCategory}>➕ Lägg till</button>
      </div>
    </div>
  );
};

export default AdminCategoryPage;
