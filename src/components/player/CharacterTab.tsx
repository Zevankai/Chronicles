import React, { useState } from 'react';
import { PlayerData, Alignment, Scar, InjurySeverity, BodyLocation, Project } from '../../types';
import { ALIGNMENTS } from '../../constants';
import { generateId } from '../../utils';

interface CharacterTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
  canEdit: boolean;
}

export function CharacterTab({ player, onChange, canEdit }: CharacterTabProps) {
  const [editingScarId, setEditingScarId] = useState<string | null>(null);
  const [newScarDesc, setNewScarDesc] = useState('');
  const [newScarSeverity, setNewScarSeverity] = useState<InjurySeverity>('minor');
  const [newScarLocation, setNewScarLocation] = useState<BodyLocation>('Limb');
  const [showAddScar, setShowAddScar] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({ name: '', description: '', progressPoints: 0, totalPoints: 10 });

  const update = <K extends keyof PlayerData>(key: K, value: PlayerData[K]) =>
    onChange({ ...player, [key]: value });

  const TextArea = ({ label, field }: { label: string; field: keyof PlayerData }) => (
    <div style={{ marginBottom: 8 }}>
      <label className="field-label">{label}</label>
      <textarea
        value={player[field] as string}
        onChange={(e) => update(field, e.target.value as PlayerData[typeof field])}
        disabled={!canEdit}
        rows={3}
      />
    </div>
  );

  const scars: Scar[] = player.scars || [];
  const projects: Project[] = player.projects || [];

  const addScar = () => {
    if (!newScarDesc.trim()) return;
    const scar: Scar = {
      id: generateId(),
      description: newScarDesc.trim(),
      severity: newScarSeverity,
      location: newScarLocation,
    };
    update('scars', [...scars, scar]);
    setNewScarDesc('');
    setShowAddScar(false);
  };

  const updateScar = (id: string, desc: string) => {
    update('scars', scars.map((s) => s.id === id ? { ...s, description: desc } : s));
    setEditingScarId(null);
  };

  const removeScar = (id: string) => {
    update('scars', scars.filter((s) => s.id !== id));
  };

  const addProject = () => {
    if (!newProject.name.trim()) return;
    const project: Project = {
      id: generateId(),
      ...newProject,
      name: newProject.name.trim(),
    };
    update('projects', [...projects, project]);
    setNewProject({ name: '', description: '', progressPoints: 0, totalPoints: 10 });
    setShowAddProject(false);
  };

  const updateProject = (id: string, changes: Partial<Project>) => {
    update('projects', projects.map((p) => p.id === id ? { ...p, ...changes } : p));
  };

  const removeProject = (id: string) => {
    update('projects', projects.filter((p) => p.id !== id));
  };

  return (
    <div>
      {/* Identity */}
      <div className="section-header">Identity</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
        <div>
          <label className="field-label">Alignment</label>
          <select
            value={player.alignment}
            onChange={(e) => update('alignment', e.target.value as Alignment)}
            disabled={!canEdit}
          >
            {ALIGNMENTS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Subclass</label>
          <input
            type="text"
            value={player.subclass ?? ''}
            onChange={(e) => update('subclass', e.target.value || undefined)}
            disabled={!canEdit}
            placeholder="e.g. Champion, Life Domain"
          />
        </div>
        <div>
          <label className="field-label">Gender</label>
          <input type="text" value={player.gender}
            onChange={(e) => update('gender', e.target.value)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Age</label>
          <input type="text" value={player.age}
            onChange={(e) => update('age', e.target.value)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Height</label>
          <input type="text" value={player.height}
            onChange={(e) => update('height', e.target.value)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Weight</label>
          <input type="text" value={player.weight}
            onChange={(e) => update('weight', e.target.value)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Eyes</label>
          <input type="text" value={player.eyes}
            onChange={(e) => update('eyes', e.target.value)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Hair</label>
          <input type="text" value={player.hair}
            onChange={(e) => update('hair', e.target.value)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Skin</label>
          <input type="text" value={player.skin}
            onChange={(e) => update('skin', e.target.value)} disabled={!canEdit} />
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label className="field-label">Journal URL</label>
        <input type="url" value={player.journalUrl}
          onChange={(e) => update('journalUrl', e.target.value)} disabled={!canEdit} />
        {player.journalUrl && (
          <a href={player.journalUrl} target="_blank" rel="noopener noreferrer"
            className="btn btn-sm btn-secondary" style={{ marginTop: 4, display: 'inline-block' }}>
            Open Journal ↗
          </a>
        )}
      </div>

      <div style={{ marginBottom: 8 }}>
        <label className="field-label">Languages</label>
        <input
          type="text"
          value={player.languages ?? ''}
          onChange={(e) => update('languages', e.target.value)}
          disabled={!canEdit}
          placeholder="e.g. Common, Elvish, Dwarvish"
        />
      </div>

      <div className="divider" />

      {/* Narrative */}
      <div className="section-header">Character</div>
      <TextArea label="Class Features" field="classFeatures" />
      <TextArea label="Species Features" field="speciesFeatures" />
      <TextArea label="Feats" field="feats" />
      <TextArea label="Background" field="background" />
      <TextArea label="Appearance" field="appearance" />
      <TextArea label="Personality" field="personality" />
      <TextArea label="Flaws" field="flaws" />
      <TextArea label="Relationships" field="relationships" />

      {/* Scars */}
      <div className="divider" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Scars ({scars.length})</div>
        {canEdit && (
          <button className="btn btn-sm btn-secondary" onClick={() => setShowAddScar(!showAddScar)}>
            + Add Scar
          </button>
        )}
      </div>

      {showAddScar && canEdit && (
        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', borderRadius: 4, padding: 8, marginBottom: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
            <div>
              <label className="field-label">Severity</label>
              <select value={newScarSeverity} onChange={(e) => setNewScarSeverity(e.target.value as InjurySeverity)}>
                <option value="minor">Minor</option>
                <option value="severe">Severe</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="field-label">Location</label>
              <select value={newScarLocation} onChange={(e) => setNewScarLocation(e.target.value as BodyLocation)}>
                <option value="Limb">Limb</option>
                <option value="Torso">Torso</option>
                <option value="Head">Head</option>
              </select>
            </div>
          </div>
          <textarea
            value={newScarDesc}
            onChange={(e) => setNewScarDesc(e.target.value)}
            placeholder="Describe the scar..."
            rows={2}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button className="btn btn-sm btn-secondary" onClick={() => { setShowAddScar(false); setNewScarDesc(''); }}>Cancel</button>
            <button className="btn btn-sm btn-primary" onClick={addScar}>Add</button>
          </div>
        </div>
      )}

      {scars.length === 0 && !showAddScar && (
        <div className="text-muted" style={{ fontSize: 12 }}>No scars</div>
      )}

      {scars.map((scar) => (
        <div key={scar.id} className={`injury-card ${scar.severity}`} style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 'bold', color: 'var(--color-text-muted)', marginBottom: 2 }}>
                [{scar.severity.toUpperCase()}] {scar.location}
              </div>
              {editingScarId === scar.id ? (
                <div>
                  <textarea
                    value={scar.description}
                    onChange={(e) => update('scars', scars.map((s) => s.id === scar.id ? { ...s, description: e.target.value } : s))}
                    rows={2}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingScarId(null)}>Cancel</button>
                    <button className="btn btn-sm btn-primary" onClick={() => setEditingScarId(null)}>Save</button>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12 }}>{scar.description}</div>
              )}
            </div>
            {canEdit && editingScarId !== scar.id && (
              <div style={{ display: 'flex', gap: 2, marginLeft: 4 }}>
                <button className="btn-icon" onClick={() => setEditingScarId(scar.id)} title="Edit">✏️</button>
                <button className="btn-icon" onClick={() => removeScar(scar.id)} title="Remove">🗑</button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Projects */}
      <div className="divider" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Projects ({projects.length})</div>
        {canEdit && (
          <button className="btn btn-sm btn-secondary" onClick={() => setShowAddProject(!showAddProject)}>
            + Add Project
          </button>
        )}
      </div>

      {showAddProject && canEdit && (
        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', borderRadius: 4, padding: 8, marginBottom: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="field-label">Project Name</label>
              <input type="text" value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="Project name..." />
            </div>
            <div>
              <label className="field-label">Target Points</label>
              <input type="number" value={newProject.totalPoints} min={1}
                onChange={(e) => setNewProject({ ...newProject, totalPoints: parseInt(e.target.value) || 1 })} />
            </div>
            <div>
              <label className="field-label">Current Progress</label>
              <input type="number" value={newProject.progressPoints} min={0}
                onChange={(e) => setNewProject({ ...newProject, progressPoints: parseInt(e.target.value) || 0 })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="field-label">Description</label>
              <textarea value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Project description..." rows={2} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-sm btn-secondary" onClick={() => { setShowAddProject(false); }}>Cancel</button>
            <button className="btn btn-sm btn-primary" onClick={addProject}>Add Project</button>
          </div>
        </div>
      )}

      {projects.length === 0 && !showAddProject && (
        <div className="text-muted" style={{ fontSize: 12 }}>No projects yet</div>
      )}

      {projects.map((project) => {
        const pct = project.totalPoints > 0 ? Math.min(100, (project.progressPoints / project.totalPoints) * 100) : 0;
        const isEditing = editingProjectId === project.id;
        return (
          <div key={project.id} style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border-light)',
            borderRadius: 4,
            padding: 8,
            marginBottom: 6,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ flex: 1 }}>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <input type="text" value={project.name}
                      onChange={(e) => updateProject(project.id, { name: e.target.value })} />
                    <textarea value={project.description}
                      onChange={(e) => updateProject(project.id, { description: e.target.value })}
                      rows={2} />
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <label className="field-label" style={{ marginBottom: 0 }}>Progress:</label>
                      <input type="number" value={project.progressPoints} min={0}
                        max={project.totalPoints}
                        onChange={(e) => updateProject(project.id, { progressPoints: parseInt(e.target.value) || 0 })}
                        style={{ width: 50 }} />
                      <span>/</span>
                      <input type="number" value={project.totalPoints} min={1}
                        onChange={(e) => updateProject(project.id, { totalPoints: parseInt(e.target.value) || 1 })}
                        style={{ width: 50 }} />
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={() => setEditingProjectId(null)}>Done</button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontWeight: 'bold', fontSize: 13 }}>{project.name}</div>
                    {project.description && (
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{project.description}</div>
                    )}
                  </>
                )}
              </div>
              {canEdit && !isEditing && (
                <div style={{ display: 'flex', gap: 2 }}>
                  <button className="btn-icon" onClick={() => setEditingProjectId(project.id)} title="Edit">✏️</button>
                  <button className="btn-icon" onClick={() => removeProject(project.id)} title="Remove">🗑</button>
                </div>
              )}
            </div>
            {!isEditing && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                  <span>Progress</span>
                  <span style={{ color: pct >= 100 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {project.progressPoints} / {project.totalPoints}
                    {pct >= 100 && ' ✅ Complete!'}
                  </span>
                </div>
                <div style={{ height: 8, background: 'var(--color-surface-dark)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: pct >= 100 ? 'var(--color-success)' : 'var(--color-primary)',
                    transition: 'width 0.3s',
                  }} />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}


interface CharacterTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
  canEdit: boolean;
}

