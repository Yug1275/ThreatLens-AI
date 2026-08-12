import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  URL:   '--tl-cyan',
  OCR:   '--tl-electric',
  QR:    '--tl-warning',
  EMAIL: '--tl-success',
  PHONE: '--tl-primary-light',
};

const WORKFLOW_STATUS_COLORS = {
  NEW: 'var(--tl-electric)',
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
  const [searchParams] = useSearchParams();

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
  const [search, setSearch]     = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') || '');
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

  // Sync from URL search params
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== search) {
      setSearch(q);
    }
  }, [searchParams]);

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
        title="Findings"
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
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', minHeight: '600px' }}>
                {[
                  { id: 'NEW', label: 'Open' },
                  // { id: 'IN_PROGRESS', label: 'In Progress' },
                  // { id: 'RESOLVED', label: 'Resolved' },
                  // { id: 'CLOSED', label: 'Canceled' }
                ].map(col => {
                  const colItems = items.filter(i => (i.workflow_status || 'NEW') === col.id);
                  return (
                    <div key={col.id} style={{ flex: '1 1 300px', minWidth: '300px', background: 'var(--tl-bg-base)', borderRadius: 'var(--tl-radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 style={{ margin: 0, fontWeight: 600, color: 'var(--tl-text-primary)' }}>{col.label} <span style={{ color: 'var(--tl-text-faint)', fontSize: '0.8125rem', marginLeft: '0.5rem' }}>{colItems.length}</span></h6>
                      </div>
                      
                      {colItems.map(inv => (
                        <div key={inv.id} className="tl-card p-3" style={{ cursor: 'pointer', borderLeft: `3px solid ${WORKFLOW_STATUS_COLORS[inv.workflow_status || 'NEW']}` }} onClick={() => navigate(`/investigations/detail/${inv.id}`)}>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', fontFamily: 'var(--tl-font-mono)' }}>{inv.id.slice(0, 8)}</span>
                            <div className="d-flex align-items-center gap-1">
                               <button className="tl-btn-ghost p-1" onClick={(e) => { e.stopPropagation(); toggleSelection(inv.id); }} style={{ background: 'none', border: 'none', color: selectedIds.has(inv.id) ? 'var(--tl-primary)' : 'var(--tl-text-muted)' }}>
                                {selectedIds.has(inv.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                              </button>
                              <RowMenu 
                                inv={inv}
                                onRename={(i) => { setEditTarget({ id: i.id, name: i.name || '', notes: i.notes || '' }) }}
                                onArchive={handleArchive}
                                onDelete={(i) => setDeleteTarget({ id: i.id, target: i.name || i.target })}
                                onRerun={handleRerun}
                                onUpdateStatus={(i) => { setSelectedIds(new Set([i.id])); setBulkActionType('update_status'); }}
                              />
                            </div>
                          </div>
                          <div style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '0.25rem' }}>{inv.name || inv.target}</div>
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <span className="tl-badge" style={{ background: 'rgba(var(--tl-primary-rgb),0.1)', color: 'var(--tl-primary)', fontSize: '0.6875rem' }}>{inv.type}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: inv.threat_score > 75 ? 'var(--tl-danger)' : inv.threat_score > 40 ? 'var(--tl-warning)' : 'var(--tl-success)' }}>
                              Score: {inv.threat_score ?? 'N/A'}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center" style={{ borderTop: '1px solid var(--tl-border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--tl-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={12} /> {formatDate(inv.created_at)}
                            </span>
                            <div className="tl-avatar" style={{ width: 20, height: 20, fontSize: '0.5rem' }}>A</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
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
