import React, { useState } from 'react';
import { UserProgressV1 } from '../../engine/progress/types';
import { exportProgressToJson, importProgressFromJson } from '../../engine/progress/storage';
import { Button } from '../common/Button';

interface ExportImportModalProps {
  progress: UserProgressV1;
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (imported: UserProgressV1) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  progress,
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    const jsonStr = exportProgressToJson(progress);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ladderquest_progress_${progress.streak.lastActiveDate || 'backup'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    setImportError(null);
    const trimmed = importText.trim();
    if (!trimmed) {
      setImportError('Please paste your exported JSON progress.');
      return;
    }

    if (trimmed.length > 500_000) {
      setImportError('Import payload exceeds maximum size limit (500 KB).');
      return;
    }

    const imported = importProgressFromJson(trimmed);
    if (!imported) {
      setImportError('Invalid or corrupted LadderQuest backup JSON.');
      return;
    }

    onImportSuccess(imported);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: '20px',
          padding: '24px 20px',
          width: '100%',
          maxWidth: '400px',
          border: '2px solid var(--color-bg-tertiary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
            Backup & Transfer
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.2rem',
              fontWeight: 900,
              cursor: 'pointer',
              padding: '4px',
              minHeight: 'auto',
              minWidth: 'auto',
            }}
          >
            ✕
          </button>
        </div>

        {/* Export Section */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-1)', marginBottom: '4px' }}>
            Export Progress
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '8px' }}>
            Download your streak, stars, and XP to a JSON file to transfer between phones or computers.
          </p>
          <Button variant="secondary" size="md" fullWidth onClick={handleDownload}>
            📥 Download Backup JSON
          </Button>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--color-bg-tertiary)' }} />

        {/* Import Section */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-2)', marginBottom: '4px' }}>
            Import Progress
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '8px' }}>
            Paste the contents of your backup JSON file below:
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='Paste {"version": 1, ...} here'
            style={{
              width: '100%',
              height: '80px',
              backgroundColor: 'var(--color-bg-canvas)',
              borderRadius: '8px',
              border: '1px solid var(--color-bg-tertiary)',
              color: '#f8fafc',
              fontSize: '0.8rem',
              padding: '8px',
              fontFamily: 'monospace',
              resize: 'none',
              marginBottom: '6px',
            }}
          />

          {importError && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '6px' }}>
              {importError}
            </p>
          )}

          <Button variant="primary" size="md" fullWidth onClick={handleImportSubmit}>
            Restore Progress
          </Button>
        </div>
      </div>
    </div>
  );
};
