import React,{ useState, useEffect } from 'react';
import api from '../services/api';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  X,
  Save,
  AlertCircle,
} from 'lucide-react';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl transform transition-all w-full max-w-lg mx-auto border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-950 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function ObjectCodes() {
  const [objectCodes, setObjectCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ code: '', headOfAccount: '', description: '', levelId: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [pageError, setPageError] = useState('');

  const [levels, setLevels] = useState([]);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [levelsModalOpen, setLevelsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [levelDeleteConfirm, setLevelDeleteConfirm] = useState(null);
  const [levelForm, setLevelForm] = useState({ name: '', parentId: '', isActive: true });
  const [levelFormError, setLevelFormError] = useState('');
  const [levelSaving, setLevelSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setPageError('');
    await Promise.all([loadObjectCodes(), loadLevels()]);
  };

  const loadLevels = async () => {
    try {
      setLevelsLoading(true);
      const data = await api.getObjectCodeLevels();
      setLevels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load object code levels:', error);
      setPageError(error.message);
    } finally {
      setLevelsLoading(false);
    }
  };

  const loadObjectCodes = async () => {
    try {
      setLoading(true);
      const data = await api.getObjectCodes();
      setObjectCodes(data);
    } catch (error) {
      console.error('Failed to load object codes:', error);
      setPageError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCode(null);
    setFormData({ code: '', headOfAccount: '', description: '', levelId: '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (oc) => {
    setEditingCode(oc);
    setFormData({
      code: oc.code,
      headOfAccount: oc.headOfAccount,
      description: oc.description || '',
      levelId: oc.levelId ?? '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      const payload = {
        ...formData,
        levelId: formData.levelId === '' ? null : Number(formData.levelId),
      };
      if (editingCode) {
        await api.updateObjectCode(editingCode.id, payload);
      } else {
        await api.createObjectCode(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteObjectCode(id);
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      setPageError(error.message);
    }
  };

  const openLevelsModal = async () => {
    setLevelsModalOpen(true);
    setLevelFormError('');
    await loadLevels();
  };

  const resetLevelForm = () => {
    setEditingLevel(null);
    setLevelForm({ name: '', parentId: '', isActive: true });
    setLevelFormError('');
  };

  const openEditLevel = (level) => {
    setEditingLevel(level);
    setLevelForm({
      name: level.name,
      parentId: level.parentId ?? '',
      isActive: !!level.isActive,
    });
    setLevelFormError('');
  };

  const saveLevel = async (e) => {
    e.preventDefault();
    setLevelFormError('');
    setLevelSaving(true);

    try {
      const payload = {
        name: levelForm.name,
        parentId: levelForm.parentId === '' ? null : Number(levelForm.parentId),
        ...(editingLevel ? { isActive: !!levelForm.isActive } : {}),
      };

      if (editingLevel) {
        await api.updateObjectCodeLevel(editingLevel.id, payload);
      } else {
        await api.createObjectCodeLevel(payload);
      }

      resetLevelForm();
      await loadLevels();
    } catch (error) {
      setLevelFormError(error.message);
    } finally {
      setLevelSaving(false);
    }
  };

  const deleteLevel = async (id) => {
    setLevelFormError('');
    try {
      await api.deleteObjectCodeLevel(id);
      setLevelDeleteConfirm(null);
      if (editingLevel?.id === id) resetLevelForm();
      await loadLevels();
      await loadObjectCodes();
    } catch (error) {
      setLevelFormError(error.message);
    }
  };

  const buildLevelTree = (allLevels) => {
    const nodesById = new Map();
    for (const lvl of allLevels) nodesById.set(lvl.id, { ...lvl, children: [] });
    const roots = [];
    for (const node of nodesById.values()) {
      if (node.parentId && nodesById.has(node.parentId)) {
        nodesById.get(node.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }
    const sort = (arr) => {
      arr.sort((a, b) => a.name.localeCompare(b.name));
      for (const n of arr) sort(n.children);
    };
    sort(roots);
    return roots;
  };

  const treeLevels = buildLevelTree(levels);

  const flattenTree = (nodes, depth = 0, acc = []) => {
    for (const n of nodes) {
      acc.push({ node: n, depth });
      if (n.children?.length) flattenTree(n.children, depth + 1, acc);
    }
    return acc;
  };

  const flatLevels = flattenTree(treeLevels);

  const filteredCodes = objectCodes.filter(
    (oc) =>
      oc.code.toLowerCase().includes(search.toLowerCase()) ||
      oc.headOfAccount.toLowerCase().includes(search.toLowerCase()) ||
      (oc.levelName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Object Codes</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage budget object codes and heads of account</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={openLevelsModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-100 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors font-medium"
          >
            <BookOpen className="w-5 h-5" />
            Manage Levels
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-medium shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-5 h-5" />
            Add Object Code
          </button>
        </div>
      </div>

      {pageError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-200">
          <AlertCircle className="w-5 h-5" />
          <span>{pageError}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search object codes..."
            className="w-full pl-12 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Object Codes Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCodes.map((oc) => (
            <div
              key={oc.id}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg shadow-teal-500/20">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(oc)}
                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(oc.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{oc.code}</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">{oc.headOfAccount}</p>
              {oc.levelName && (
                <div className="mb-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                    {oc.levelName}
                  </span>
                </div>
              )}
              {oc.description && <p className="text-slate-400 dark:text-slate-500 text-xs">{oc.description}</p>}
            </div>
          ))}
          {filteredCodes.length === 0 && (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No object codes found</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCode ? 'Edit Object Code' : 'Create Object Code'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Code Level (Optional)</label>
            <select
              value={formData.levelId}
              onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
              disabled={levelsLoading}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 disabled:opacity-60"
            >
              <option value="">No level</option>
              {flatLevels.map(({ node, depth }) => (
                <option key={node.id} value={node.id} disabled={!node.isActive}>
                  {`${'—'.repeat(depth)}${depth > 0 ? ' ' : ''}${node.name}${node.isActive ? '' : ' (inactive)'}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Create levels like “Major Head”, “Minor Head”, “Utility”, etc. from “Manage Levels”.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Object Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
              placeholder="e.g., A01101"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Head of Account</label>
            <input
              type="text"
              value={formData.headOfAccount}
              onChange={(e) => setFormData({ ...formData, headOfAccount: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
              placeholder="e.g., Pay of Officers"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
              rows={3}
              placeholder="Additional description..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Levels Modal */}
      <Modal
        isOpen={levelsModalOpen}
        onClose={() => {
          setLevelsModalOpen(false);
          setLevelDeleteConfirm(null);
          resetLevelForm();
        }}
        title="Manage Code Levels"
      >
        <div className="space-y-6">
          {levelFormError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span style={{ whiteSpace: 'pre-line' }}>{levelFormError}</span>
            </div>
          )}

          <form onSubmit={saveLevel} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Level Name</label>
              <input
                type="text"
                value={levelForm.name}
                onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                placeholder="e.g., Major Head"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Parent Level (Optional)</label>
              <select
                value={levelForm.parentId}
                onChange={(e) => setLevelForm({ ...levelForm, parentId: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
              >
                <option value="">No parent (top-level)</option>
                {flatLevels
                  .filter(({ node }) => !editingLevel || node.id !== editingLevel.id)
                  .map(({ node, depth }) => (
                    <option key={node.id} value={node.id} disabled={!node.isActive}>
                      {`${'—'.repeat(depth)}${depth > 0 ? ' ' : ''}${node.name}${node.isActive ? '' : ' (inactive)'}`}
                    </option>
                  ))}
              </select>
            </div>

            {editingLevel && (
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={!!levelForm.isActive}
                  onChange={(e) => setLevelForm({ ...levelForm, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
                />
                Active
              </label>
            )}

            <div className="flex gap-3 justify-end">
              {editingLevel && (
                <button
                  type="button"
                  onClick={resetLevelForm}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors font-medium"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={levelSaving}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {levelSaving ? 'Saving...' : editingLevel ? 'Update Level' : 'Add Level'}
              </button>
            </div>
          </form>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Existing Levels</h4>
              <button
                type="button"
                onClick={loadLevels}
                className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Refresh
              </button>
            </div>

            {levelsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : flatLevels.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No levels yet. Add one above.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                {flatLevels.map(({ node, depth }) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                        <span className="text-slate-400 dark:text-slate-600">{depth > 0 ? '—'.repeat(depth) + ' ' : ''}</span>
                        {node.name}
                        {!node.isActive && (
                          <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">(inactive)</span>
                        )}
                      </div>
                      {node.parentName && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">Parent: {node.parentName}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditLevel(node)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-slate-900 rounded-lg text-blue-600 dark:text-blue-300 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setLevelDeleteConfirm(node.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-slate-900 rounded-lg text-red-600 dark:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Level Confirmation Modal */}
      <Modal isOpen={!!levelDeleteConfirm} onClose={() => setLevelDeleteConfirm(null)} title="Confirm Delete Level">
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete this level? If it has sublevels or is assigned to any object codes, deletion will be blocked.</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setLevelDeleteConfirm(null)}
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteLevel(levelDeleteConfirm)}
              className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete this object code? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirm)}
              className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
