import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, Search, Filter, Trash2, ExternalLink, ChevronLeft, ChevronRight,
  AlertTriangle, Clock, Globe, Mail, Phone, ScanLine, QrCode,
  X, TriangleAlert, Star, MoreVertical, Edit3, Archive, RefreshCw, CheckSquare, Square, Tag,
  Folder, FolderPlus, Bookmark, BookmarkPlus, MoveRight, CheckCircle2, Circle
} from 'lucide-react';
import investigationService from '../services/investigationService';
import workspaceService from '../services/workspaceService';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

// ── Helpers ───────────────────────────────────────────────────────────── //

const TYPE_ICONS = {
  URL:   <Globe size={14} />,
  OCR:   <ScanLine size={14} />,
  QR:    <QrCode size={14} />,
  EMAIL: <Mail size={14} />,
  PHONE: <Phone size={14} />,
};

const TYPE_COLORS = {
  URL:   '--tl-primary-light',
  OCR:   '--tl-info',
  QR:    '--tl-warning',
  EMAIL: '--tl-success',
  PHONE: '--tl-accent',
};

const WORKFLOW_STATUS_COLORS = {
  NEW: 'var(--tl-info)',
  IN_PROGRESS: 'var(--tl-warning)',
  RESOLVED: 'var(--tl-success)',
  CLOSED: 'var(--tl-text-muted)'
};

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

const Skeleton = ({ h = '20px', w = '100%', rounded = false }) => (
  <div className="tl-skeleton" style={{ height: h, width: w, borderRadius: rounded ? 9999 : undefined }} />
);

// ── Modals ────────────────────────────────────────────────────────────── //

const ActionModal = ({ title, description, children, onConfirm, onCancel, confirmText, confirmVariant = 'primary', loading, disabled }) => (
  <div
    style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      onClick={e => e.stopPropagation()}
      className="tl-card p-4"
      style={{ maxWidth: 440, width: '100%' }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div style={{ fontWeight: 700, color: 'var(--tl-text-primary)', fontSize: '1.125rem' }}>{title}</div>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tl-text-muted)' }}>
          <X size={18} />
        </button>
      </div>
      {description && <p style={{ color: 'var(--tl-text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{description}</p>}
      
      <div className="mb-4">
        {children}
      </div>

      <div className="d-flex gap-3 justify-content-end">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading || disabled}>
          {loading ? 'Saving…' : confirmText}
        </Button>
      </div>
    </motion.div>
  </div>
);

// ── Dropdown Menu ─────────────────────────────────────────────────────── //

const RowMenu = ({ inv, onRename, onArchive, onDelete, onRerun, onUpdateStatus }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const hide = () => setOpen(false);
    document.addEventListener('click', hide);
    return () => document.removeEventListener('click', hide);
  }, [open]);

  return (
    <div style={{ position: 'relative' }}>
      <button 
        className="tl-btn tl-btn-ghost tl-btn-sm" 
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
      >
        <MoreVertical size={16} />
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
            style={{
              position: 'absolute', right: 0, top: '100%', zIndex: 50,
              background: 'var(--tl-bg-elevated)', border: '1px solid var(--tl-border)', borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)', padding: '0.5rem', minWidth: 160
            }}
          >
            <button className="dropdown-item d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.8125rem', padding: '6px 12px', borderRadius: 4, color: 'var(--tl-text-primary)' }} onClick={() => onRename(inv)}>
              <Edit3 size={14} /> Rename / Notes
            </button>
            <button className="dropdown-item d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.8125rem', padding: '6px 12px', borderRadius: 4, color: 'var(--tl-text-primary)' }} onClick={() => onUpdateStatus(inv)}>
              <CheckCircle2 size={14} /> Set Workflow Status
            </button>
            <button className="dropdown-item d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.8125rem', padding: '6px 12px', borderRadius: 4, color: 'var(--tl-text-primary)' }} onClick={() => onArchive(inv)}>
              <Archive size={14} /> {inv.is_archived ? 'Unarchive' : 'Archive'}
            </button>
            <button className="dropdown-item d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.8125rem', padding: '6px 12px', borderRadius: 4, color: 'var(--tl-text-primary)' }} onClick={() => onRerun(inv)}>
              <RefreshCw size={14} /> Re-run
            </button>
            <div style={{ height: 1, background: 'var(--tl-border)', margin: '4px 0' }} />
            <button className="dropdown-item d-flex align-items-center gap-2" style={{ fontSize: '0.8125rem', padding: '6px 12px', borderRadius: 4, color: 'var(--tl-danger)' }} onClick={() => onDelete(inv)}>
              <Trash2 size={14} /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// ── Main Page ─────────────────────────────────────────────────────────── //

const TYPES = ['', 'URL', 'OCR', 'QR', 'EMAIL', 'PHONE'];
const STATUSES = ['', 'COMPLETED', 'FAILED', 'PENDING'];
const WORKFLOW_STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function AnalystWorkspace() {
  const navigate = useNavigate();

  // Data state
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Workspace state
  const [folders, setFolders] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  
  // Filters + pagination
  const [page, setPage]         = useState(1);
  const [typeFilter, setType]   = useState('');
  const [statusFilter, setStatus] = useState('');
  const [search, setSearch]     = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy]     = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewFavorites, setViewFavorites] = useState(false);
  const [viewArchived, setViewArchived]   = useState(false);
  
  // Workspace specific filters
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [workflowStatusFilter, setWorkflowStatusFilter] = useState('');
  
  const LIMIT = 15;

  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modals
  const [deleteTarget, setDeleteTarget] = useState(null); // single delete { id, target }
  const [editTarget, setEditTarget]     = useState(null); // { id, name, notes }
  
  const [bulkActionType, setBulkActionType] = useState(null); // 'delete', 'update_folder', 'update_status'
  const [bulkActionValue, setBulkActionValue] = useState('');
  const [submitting, setSubmitting]     = useState(false);
  
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [saveSearchModal, setSaveSearchModal] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // ── Fetch ── //
  const fetchWorkspaceData = async () => {
    try {
      const [f, s] = await Promise.all([
        workspaceService.getFolders(),
        workspaceService.getSavedSearches()
      ]);
      setFolders(f);
      setSavedSearches(s);
    } catch(e) {
      console.error("Failed to fetch workspace data", e);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await investigationService.getAll({
        page,
        limit: LIMIT,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        is_favorite: viewFavorites ? true : undefined,
        is_archived: viewArchived ? true : false,
        folder_id: selectedFolderId || undefined,
        workflow_status: workflowStatusFilter || undefined,
      });
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
      
      setSelectedIds(new Set());
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load investigation history.');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter, debouncedSearch, sortBy, sortOrder, viewFavorites, viewArchived, selectedFolderId, workflowStatusFilter]);

  useEffect(() => { 
    fetchWorkspaceData(); 
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page when filters or search change
  useEffect(() => { setPage(1); }, [typeFilter, statusFilter, debouncedSearch, sortBy, sortOrder, viewFavorites, viewArchived, selectedFolderId, workflowStatusFilter]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // ── Selections ── //
  const toggleSelection = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };
  
  const toggleAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  // ── Actions ── //
  const toggleFavorite = async (inv) => {
    try {
      await investigationService.updateInvestigation(inv.id, { is_favorite: !inv.is_favorite });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchive = async (inv) => {
    try {
      await investigationService.updateInvestigation(inv.id, { is_archived: !inv.is_archived });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await investigationService.deleteInvestigation(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkActionConfirm = async () => {
    if (selectedIds.size === 0 || !bulkActionType) return;
    setSubmitting(true);
    
    try {
      let options = {};
      if (bulkActionType === 'update_folder') options.folder_id = bulkActionValue || null;
      if (bulkActionType === 'update_status') options.workflow_status = bulkActionValue;
      
      await investigationService.bulkAction(bulkActionType, Array.from(selectedIds), options);
      
      setBulkActionType(null);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      await investigationService.updateInvestigation(editTarget.id, {
        name: editTarget.name,
        notes: editTarget.notes
      });
      setEditTarget(null);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRerun = (inv) => {
    navigate(`/investigations/${inv.type.toLowerCase()}`, { state: { target: inv.target } });
  };

  // Workspace Actions
  const handleCreateFolder = async () => {
    if(!newFolderName) return;
    setSubmitting(true);
    try {
      await workspaceService.createFolder(newFolderName);
      setNewFolderModal(false);
      setNewFolderName('');
      fetchWorkspaceData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleSaveSearch = async () => {
    if(!newSearchName) return;
    setSubmitting(true);
    try {
      const filters = {
        type: typeFilter,
        status: statusFilter,
        search: search,
        is_favorite: viewFavorites,
        is_archived: viewArchived,
        folder_id: selectedFolderId,
        workflow_status: workflowStatusFilter
      };
      await workspaceService.createSavedSearch({ name: newSearchName, filters });
      setSaveSearchModal(false);
      setNewSearchName('');
      fetchWorkspaceData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };
  
  const applySavedSearch = (searchObj) => {
    const f = searchObj.filters || {};
    setType(f.type || '');
    setStatus(f.status || '');
    setSearch(f.search || '');
    setViewFavorites(f.is_favorite || false);
    setViewArchived(f.is_archived || false);
    setSelectedFolderId(f.folder_id || null);
    setWorkflowStatusFilter(f.workflow_status || '');
  };

  return (
    <div className="pb-5">
      <PageHeader
        title="Analyst Workspace"
        subtitle="Organize, filter, and manage all your past threat investigations."
      />

      <div className="row g-4">
        {/* ── Left Sidebar (Workspace) ── */}
        <div className="col-md-3">
          {/* Folders */}
          <div className="tl-card p-3 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="m-0" style={{ fontWeight: 600, color: 'var(--tl-text-primary)' }}>Collections</h6>
              <button className="tl-btn-ghost p-1" style={{ color: 'var(--tl-text-muted)', border: 'none', background: 'none' }} onClick={() => setNewFolderModal(true)}>
                <FolderPlus size={16} />
              </button>
            </div>
            <div className="d-flex flex-column gap-1">
              <button 
                className="tl-btn-ghost text-start px-2 py-1"
                style={{ 
                  borderRadius: 6, border: 'none', 
                  background: selectedFolderId === null ? 'rgba(var(--tl-primary-rgb), 0.1)' : 'transparent',
                  color: selectedFolderId === null ? 'var(--tl-primary)' : 'var(--tl-text-secondary)',
                  fontSize: '0.875rem'
                }}
                onClick={() => setSelectedFolderId(null)}
              >
                <Folder size={14} className="me-2" /> All Investigations
              </button>
              {folders.map(f => (
                <button 
                  key={f.id}
                  className="tl-btn-ghost text-start px-2 py-1"
                  style={{ 
                    borderRadius: 6, border: 'none', 
                    background: selectedFolderId === f.id ? 'rgba(var(--tl-primary-rgb), 0.1)' : 'transparent',
                    color: selectedFolderId === f.id ? 'var(--tl-primary)' : 'var(--tl-text-secondary)',
                    fontSize: '0.875rem',
                    display: 'flex', alignItems: 'center'
                  }}
                  onClick={() => setSelectedFolderId(f.id)}
                >
                  <Folder size={14} className="me-2" style={{ opacity: 0.7 }} /> 
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Saved Searches */}
          <div className="tl-card p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="m-0" style={{ fontWeight: 600, color: 'var(--tl-text-primary)' }}>Saved Searches</h6>
              <button className="tl-btn-ghost p-1" style={{ color: 'var(--tl-text-muted)', border: 'none', background: 'none' }} onClick={() => setSaveSearchModal(true)}>
                <BookmarkPlus size={16} />
              </button>
            </div>
            {savedSearches.length === 0 ? (
              <div className="text-center p-3">
                <span style={{ fontSize: '0.8125rem', color: 'var(--tl-text-faint)' }}>No saved searches.</span>
              </div>
            ) : (
              <div className="d-flex flex-column gap-1">
                {savedSearches.map(s => (
                  <button 
                    key={s.id}
                    className="tl-btn-ghost text-start px-2 py-1"
                    style={{ 
                      borderRadius: 6, border: 'none', 
                      background: 'transparent',
                      color: 'var(--tl-text-secondary)',
                      fontSize: '0.875rem',
                      display: 'flex', alignItems: 'center'
                    }}
                    onClick={() => applySavedSearch(s)}
                  >
                    <Bookmark size={14} className="me-2" style={{ opacity: 0.7 }} /> 
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* ── Main Content Area ── */}
        <div className="col-md-9">
          {/* ── Filter Bar ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tl-card p-4 mb-4">
            <div className="row g-3 align-items-end">
              {/* Search */}
              <div className="col-md-3">
                <label className="mb-1" style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', fontWeight: 500 }}>Search Target / Name</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--tl-text-muted)' }} />
                  <input
                    className="tl-input w-100"
                    placeholder="Search…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              {/* Type */}
              <div className="col-md-2">
                <label className="mb-1" style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', fontWeight: 500 }}>Type</label>
                <select className="tl-input w-100" value={typeFilter} onChange={e => setType(e.target.value)}>
                  <option value="">All</option>
                  {TYPES.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Status */}
              <div className="col-md-2">
                <label className="mb-1" style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', fontWeight: 500 }}>Status</label>
                <select className="tl-input w-100" value={statusFilter} onChange={e => setStatus(e.target.value)}>
                  <option value="">All</option>
                  {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              {/* Workflow Status */}
              <div className="col-md-2">
                <label className="mb-1" style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', fontWeight: 500 }}>Workflow</label>
                <select className="tl-input w-100" value={workflowStatusFilter} onChange={e => setWorkflowStatusFilter(e.target.value)}>
                  <option value="">All</option>
                  {WORKFLOW_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Toggles */}
              <div className="col-md-3 d-flex flex-column gap-2">
                <label className="d-flex align-items-center gap-2 mb-0" style={{ cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--tl-text-primary)' }}>
                  <input type="checkbox" checked={viewFavorites} onChange={e => setViewFavorites(e.target.checked)} style={{ accentColor: 'var(--tl-primary)' }} />
                  <Star size={14} color={viewFavorites ? "var(--tl-warning)" : "var(--tl-text-muted)"} fill={viewFavorites ? "var(--tl-warning)" : "none"} /> Favorites Only
                </label>
                <label className="d-flex align-items-center gap-2 mb-0" style={{ cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--tl-text-primary)' }}>
                  <input type="checkbox" checked={viewArchived} onChange={e => setViewArchived(e.target.checked)} style={{ accentColor: 'var(--tl-primary)' }} />
                  <Archive size={14} /> Show Archived
                </label>
              </div>
            </div>
            
            {(typeFilter || statusFilter || search || viewFavorites || viewArchived || workflowStatusFilter) && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--tl-border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="tl-btn tl-btn-ghost tl-btn-sm text-muted"
                  onClick={() => { setType(''); setStatus(''); setSearch(''); setViewFavorites(false); setViewArchived(false); setWorkflowStatusFilter(''); }}
                >
                  <X size={14} className="me-1" /> Clear Filters
                </button>
              </div>
            )}
          </motion.div>

          {/* ── Bulk Actions Bar ── */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="tl-card p-3 mb-4 d-flex flex-wrap gap-3 justify-content-between align-items-center" style={{ background: 'rgba(var(--tl-primary-rgb), 0.05)', borderColor: 'var(--tl-primary)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--tl-text-primary)' }}>
                    {selectedIds.size} item{selectedIds.size !== 1 && 's'} selected
                  </span>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <Button variant="ghost" onClick={() => setSelectedIds(new Set())} size="sm">Cancel</Button>
                    
                    <select 
                      className="tl-input" 
                      style={{ fontSize: '0.8125rem', padding: '4px 8px', height: '32px' }}
                      value={bulkActionType || ''}
                      onChange={e => setBulkActionType(e.target.value)}
                    >
                      <option value="">Bulk Action...</option>
                      <option value="update_folder">Move to Collection</option>
                      <option value="update_status">Change Workflow Status</option>
                      <option value="archive">Archive</option>
                      <option value="unarchive">Unarchive</option>
                      <option value="delete">Delete</option>
                    </select>
                    
                    {bulkActionType === 'update_folder' && (
                      <select 
                        className="tl-input" 
                        style={{ fontSize: '0.8125rem', padding: '4px 8px', height: '32px' }}
                        value={bulkActionValue}
                        onChange={e => setBulkActionValue(e.target.value)}
                      >
                        <option value="">Remove from Collection</option>
                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    )}
                    
                    {bulkActionType === 'update_status' && (
                      <select 
                        className="tl-input" 
                        style={{ fontSize: '0.8125rem', padding: '4px 8px', height: '32px' }}
                        value={bulkActionValue}
                        onChange={e => setBulkActionValue(e.target.value)}
                      >
                        <option value="">Select Status...</option>
                        {WORKFLOW_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                    
                    <Button 
                      variant={bulkActionType === 'delete' ? 'danger' : 'primary'} 
                      onClick={handleBulkActionConfirm} 
                      size="sm" 
                      disabled={!bulkActionType || submitting}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Table ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="tl-card">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center p-4" style={{ borderBottom: '1px solid var(--tl-border)' }}>
              <div>
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>
                  {total > 0 ? `${total} Investigation${total !== 1 ? 's' : ''}` : 'Investigations'}
                </h6>
              </div>
            </div>

            {/* Body */}
            {error ? (
              <div className="p-5 text-center">
                <AlertTriangle size={32} color="var(--tl-danger)" className="mb-3" />
                <p style={{ color: 'var(--tl-text-muted)' }}>{error}</p>
                <Button onClick={fetchData} size="sm">Retry</Button>
              </div>
            ) : loading ? (
              <div className="p-4 d-flex flex-column gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="d-flex gap-3 align-items-center">
                    <Skeleton w="28px" h="28px" rounded />
                    <div style={{ flex: 1 }}><Skeleton h="14px" w="60%" /></div>
                    <Skeleton h="14px" w="80px" />
                    <Skeleton h="22px" w="70px" />
                    <Skeleton h="14px" w="120px" />
                    <Skeleton h="28px" w="60px" />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="p-5 text-center">
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(var(--tl-primary-rgb),0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <History size={24} color="var(--tl-primary-light)" />
                </div>
                <h6 style={{ color: 'var(--tl-text-primary)', fontWeight: 600 }}>No investigations yet</h6>
                <p style={{ color: 'var(--tl-text-muted)', maxWidth: 340, margin: '0 auto 1.25rem' }}>
                  {search || typeFilter || statusFilter || viewFavorites || viewArchived || selectedFolderId
                    ? 'No results match your current filters.'
                    : 'Run your first investigation to see it here.'}
                </p>
                <Button onClick={() => navigate('/investigations/url')}>
                  Start Investigation
                </Button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="tl-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40, textAlign: 'center' }}>
                        <button className="tl-btn-ghost p-1" onClick={toggleAll} style={{ background: 'none', border: 'none', color: 'var(--tl-text-muted)' }}>
                          {selectedIds.size === items.length && items.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </th>
                      <th style={{ width: 40, textAlign: 'center' }}></th>
                      <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('type')}>
                        Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('target')}>
                        Target {sortBy === 'target' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Workflow</th>
                      <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('threat_score')}>
                        Score {sortBy === 'threat_score' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('created_at')}>
                        Date {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {items.map((inv, i) => (
                        <motion.tr
                          key={inv.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: i * 0.03 }}
                          style={{ background: selectedIds.has(inv.id) ? 'rgba(var(--tl-primary-rgb), 0.05)' : undefined }}
                        >
                          {/* Checkbox */}
                          <td style={{ textAlign: 'center' }}>
                            <button className="tl-btn-ghost p-1" onClick={() => toggleSelection(inv.id)} style={{ background: 'none', border: 'none', color: selectedIds.has(inv.id) ? 'var(--tl-primary)' : 'var(--tl-text-muted)' }}>
                              {selectedIds.has(inv.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                            </button>
                          </td>
                          
                          {/* Favorite */}
                          <td style={{ textAlign: 'center' }}>
                            <button className="tl-btn-ghost p-1" onClick={() => toggleFavorite(inv)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                              <Star size={16} color={inv.is_favorite ? 'var(--tl-warning)' : 'var(--tl-border)'} fill={inv.is_favorite ? 'var(--tl-warning)' : 'none'} />
                            </button>
                          </td>

                          {/* Type */}
                          <td>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '3px 10px', borderRadius: 6,
                              background: 'rgba(var(--tl-primary-rgb),0.08)',
                              color: `var(${TYPE_COLORS[inv.type] || '--tl-primary-light'})`,
                              fontSize: '0.75rem', fontWeight: 600,
                            }}>
                              {TYPE_ICONS[inv.type] || null}
                              {inv.type}
                            </span>
                          </td>

                          {/* Target */}
                          <td style={{ maxWidth: 240 }}>
                            {inv.name ? (
                              <div style={{ color: 'var(--tl-text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>{inv.name}</div>
                            ) : null}
                            <span style={{
                              color: inv.name ? 'var(--tl-text-secondary)' : 'var(--tl-text-primary)', 
                              fontWeight: inv.name ? 400 : 500, fontSize: '0.875rem',
                              display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }} title={inv.target}>
                              {inv.target}
                            </span>
                            
                            <div className="d-flex flex-wrap gap-2 mt-1 align-items-center">
                              {inv.is_archived && <span style={{ fontSize: '0.65rem', background: 'var(--tl-border)', padding: '2px 6px', borderRadius: 4, color: 'var(--tl-text-muted)' }}>ARCHIVED</span>}
                              {inv.folder_id && <span style={{ fontSize: '0.65rem', background: 'rgba(var(--tl-primary-rgb),0.1)', color: 'var(--tl-primary)', padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Folder size={10} /> {folders.find(f => f.id === inv.folder_id)?.name || 'Folder'}</span>}
                              {inv.tags && inv.tags.map(t => (
                                <span key={t} style={{ fontSize: '0.65rem', background: 'rgba(var(--tl-info-rgb),0.1)', color: 'var(--tl-info)', padding: '2px 6px', borderRadius: 4 }}>
                                  {t}
                                </span>
                              ))}
                              {inv.notes && (
                                <span style={{ fontSize: '0.65rem', color: 'var(--tl-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setEditTarget({ id: inv.id, name: inv.name || '', notes: inv.notes || '' })}>
                                  <Edit3 size={10}/> Notes
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Workflow */}
                          <td>
                            <div className="d-flex flex-column gap-1">
                               <span style={{
                                fontSize: '0.75rem', fontWeight: 600, color: WORKFLOW_STATUS_COLORS[inv.workflow_status || 'NEW'] || 'var(--tl-text-primary)',
                                display: 'flex', alignItems: 'center', gap: 4
                              }}>
                                <Circle size={10} fill={WORKFLOW_STATUS_COLORS[inv.workflow_status || 'NEW']} stroke="none" />
                                {(inv.workflow_status || 'NEW').replace('_', ' ')}
                              </span>
                              {inv.status !== 'COMPLETED' && (
                                <span style={{ fontSize: '0.65rem', color: inv.status === 'FAILED' ? 'var(--tl-danger)' : 'var(--tl-warning)' }}>
                                  {inv.status}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Score */}
                          <td>
                            <span style={{
                              fontWeight: 700, fontSize: '0.9375rem',
                              color: inv.threat_score > 75 ? 'var(--tl-danger)' : inv.threat_score > 40 ? 'var(--tl-warning)' : 'var(--tl-success)',
                            }}>
                              {inv.threat_score ?? '—'}
                            </span>
                            {inv.threat_score != null && <span style={{ color: 'var(--tl-text-faint)', fontSize: '0.6875rem' }}>/100</span>}
                          </td>

                          {/* Date */}
                          <td>
                            <span style={{ color: 'var(--tl-text-muted)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Clock size={12} style={{ opacity: 0.5 }} />
                              {formatDate(inv.created_at)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div className="d-flex justify-content-end align-items-center gap-1">
                              <button
                                className="tl-btn tl-btn-ghost tl-btn-sm px-2"
                                onClick={() => navigate(`/investigations/detail/${inv.id}`)}
                                title="View report"
                              >
                                <ExternalLink size={14} />
                              </button>
                              
                              <RowMenu 
                                inv={inv}
                                onRename={(inv) => setEditTarget({ id: inv.id, name: inv.name || '', notes: inv.notes || '' })}
                                onArchive={handleArchive}
                                onDelete={(inv) => setDeleteTarget({ id: inv.id, target: inv.name || inv.target })}
                                onRerun={handleRerun}
                                onUpdateStatus={(inv) => {
                                  setSelectedIds(new Set([inv.id]));
                                  setBulkActionType('update_status');
                                }}
                              />
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Pagination ── */}
            {!loading && pages > 1 && (
              <div className="d-flex justify-content-between align-items-center p-4" style={{ borderTop: '1px solid var(--tl-border)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>
                  Page {page} of {pages} · {total} total
                </span>
                <div className="d-flex gap-2">
                  <button
                    className="tl-btn tl-btn-secondary tl-btn-sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button
                    className="tl-btn tl-btn-secondary tl-btn-sm"
                    disabled={page >= pages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {editTarget && (
          <ActionModal
            title="Edit Investigation Details"
            onConfirm={handleEditSave}
            onCancel={() => setEditTarget(null)}
            confirmText="Save Changes"
            loading={submitting}
          >
            <div className="mb-3">
              <label className="mb-1" style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>Name (Optional)</label>
              <input 
                type="text" 
                className="tl-input w-100" 
                value={editTarget.name}
                onChange={e => setEditTarget({...editTarget, name: e.target.value})}
                placeholder="Give this investigation a friendly name..."
              />
            </div>
            <div>
              <label className="mb-1" style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>Notes</label>
              <textarea 
                className="tl-input w-100" 
                rows={4}
                value={editTarget.notes}
                onChange={e => setEditTarget({...editTarget, notes: e.target.value})}
                placeholder="Add some notes about your findings..."
                style={{ resize: 'vertical' }}
              />
            </div>
          </ActionModal>
        )}
        
        {deleteTarget && (
          <ActionModal
            title="Delete Investigation"
            description={`Are you sure you want to delete the investigation for ${deleteTarget.target}? This action cannot be undone.`}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
            confirmText="Delete"
            confirmVariant="danger"
            loading={submitting}
          />
        )}
        
        {newFolderModal && (
          <ActionModal
            title="Create Collection"
            description="Create a new folder to organize your investigations."
            onConfirm={handleCreateFolder}
            onCancel={() => setNewFolderModal(false)}
            confirmText="Create"
            loading={submitting}
            disabled={!newFolderName}
          >
            <div>
              <label className="mb-1" style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>Collection Name</label>
              <input 
                type="text" 
                className="tl-input w-100" 
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="e.g. Phishing Campaign Alpha"
                autoFocus
              />
            </div>
          </ActionModal>
        )}
        
        {saveSearchModal && (
          <ActionModal
            title="Save Search"
            description="Save your current filters to quickly access them later."
            onConfirm={handleSaveSearch}
            onCancel={() => setSaveSearchModal(false)}
            confirmText="Save Search"
            loading={submitting}
            disabled={!newSearchName}
          >
            <div>
              <label className="mb-1" style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>Search Name</label>
              <input 
                type="text" 
                className="tl-input w-100" 
                value={newSearchName}
                onChange={e => setNewSearchName(e.target.value)}
                placeholder="e.g. High Risk URLs"
                autoFocus
              />
            </div>
          </ActionModal>
        )}
      </AnimatePresence>
    </div>
  );
}
