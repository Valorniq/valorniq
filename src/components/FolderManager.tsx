import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  GripVertical, 
  Folder, 
  FolderOpen,
  Save,
  XCircle
} from 'lucide-react';

interface Folder {
  id: string;
  name: string;
  icon?: string;
  children: string[];
  order: number;
}

interface FolderManagerProps {
  folders: Record<string, Folder>;
  onFolderCreate: (name: string) => void;
  onFolderRename: (folderId: string, newName: string) => void;
  onFolderDelete: (folderId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FolderManager: React.FC<FolderManagerProps> = ({
  folders,
  onFolderCreate,
  onFolderRename,
  onFolderDelete,
  isOpen,
  onClose
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onFolderCreate(newFolderName);
      setNewFolderName('');
    }
  };

  const handleRename = (folderId: string, newName: string) => {
    if (newName.trim()) {
      onFolderRename(folderId, newName);
      setEditingFolderId(null);
    }
  };

  const folderList = Object.values(folders).sort((a, b) => a.order - b.order);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Manage Folders</h2>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Create New Folder */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Create New Folder</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <button 
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Existing Folders */}
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {folderList.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">No custom folders yet</p>
              ) : (
                folderList.map((folder) => (
                  <div key={folder.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-300 transition-colors group">
                    <GripVertical className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                    <Folder className="w-4 h-4 text-indigo-500 shrink-0" />
                    
                    {editingFolderId === folder.id ? (
                      <input 
                        type="text"
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleRename(folder.id, editingName)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(folder.id, editingName);
                          if (e.key === 'Escape') setEditingFolderId(null);
                        }}
                        className="flex-1 bg-white border border-indigo-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    ) : (
                      <span className="flex-1 text-sm font-medium text-slate-900">{folder.name}</span>
                    )}
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingFolderId(folder.id);
                          setEditingName(folder.name);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onFolderDelete(folder.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={onClose}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all"
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FolderManager;
