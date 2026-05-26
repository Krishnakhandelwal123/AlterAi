import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Check, ImagePlus, Loader2, Mail, MapPin, Save, Shield, User, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import {
  DEFAULT_NOTIFICATION_PREFS,
  EMAIL_NOTIFICATION_GROUPS,
  IN_APP_NOTIFICATION_GROUPS
} from '../../constants/notificationPrefs.js';

const Settings = () => {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const fileRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Profile');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [form, setForm] = useState({
    name: '',
    bio: '',
    website: '',
    location: '',
    notifications: { ...DEFAULT_NOTIFICATION_PREFS }
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || user.email?.split('@')[0] || '',
      bio: user.bio || '',
      website: user.website || '',
      location: user.location || '',
      notifications: {
        ...DEFAULT_NOTIFICATION_PREFS,
        ...(user.notifications || {})
      }
    });
    setPreview(user.avatar || '');
  }, [user]);

  const displayName = form.name || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();
  const isDirty = useMemo(() => {
    if (!user) return false;
    return (
      form.name !== (user.name || '') ||
      form.bio !== (user.bio || '') ||
      form.website !== (user.website || '') ||
      form.location !== (user.location || '') ||
      JSON.stringify(form.notifications) !==
        JSON.stringify({ ...DEFAULT_NOTIFICATION_PREFS, ...(user.notifications || {}) })
    );
  }, [form, user]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setNotification = (key) => {
    setForm((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const save = async () => {
    setSaving(true);
    const result = await updateProfile(form);
    setSaving(false);

    if (result.success) {
      toast.success('Settings saved');
      return;
    }

    toast.error(result.error || 'Could not save settings');
  };

  const onAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Avatar must be under 2 MB');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);
    const result = await uploadAvatar(file);
    setUploading(false);
    URL.revokeObjectURL(localPreview);

    if (result.success) {
      setPreview(result.profile.avatar || '');
      toast.success('Avatar updated');
      return;
    }

    setPreview(user?.avatar || '');
    toast.error(result.error || 'Could not upload avatar');
  };

  const tabs = [
    { label: 'Profile', icon: User },
    { label: 'Notifications', icon: Bell },
    { label: 'Security', icon: Shield }
  ];

  return (
    <>
      <main className="settings-page" data-scroll-section>
        <aside className="settings-tabs">
          {tabs.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className={activeTab === label ? 'is-active' : ''}
              onClick={() => setActiveTab(label)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </aside>

        <div className="settings-content">
          {activeTab === 'Profile' && (
            <>
              <section className="settings-card">
                <div className="settings-card-head">
                  <div>
                    <p>Profile</p>
                    <h2>Public identity</h2>
                  </div>
                  <button type="button" onClick={save} disabled={!isDirty || saving}>
                    {saving ? <Loader2 className="settings-spin" size={14} /> : <Save size={14} />}
                    Save
                  </button>
                </div>

                <div className="settings-avatar-row">
                  <div className="settings-avatar">
                    {preview ? <img src={preview} alt="" /> : <span>{initial}</span>}
                    {uploading ? (
                      <div className="settings-avatar-busy">
                        <Loader2 className="settings-spin" size={18} />
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onAvatarChange} hidden />
                    <button type="button" className="settings-secondary-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      <ImagePlus size={14} />
                      Upload photo
                    </button>
                    <p className="settings-help">PNG, JPG, WEBP, or GIF. Max 2 MB.</p>
                  </div>
                </div>

                <div className="settings-grid">
                  <label>
                    <span>Display name</span>
                    <input value={form.name} maxLength={50} onChange={(event) => setField('name', event.target.value)} />
                  </label>
                  <label>
                    <span>Location</span>
                    <div className="settings-input-icon">
                      <MapPin size={14} />
                      <input value={form.location} maxLength={80} onChange={(event) => setField('location', event.target.value)} placeholder="City, Country" />
                    </div>
                  </label>
                  <label className="settings-wide">
                    <span>Website</span>
                    <input value={form.website} onChange={(event) => setField('website', event.target.value)} placeholder="https://your-site.com" />
                  </label>
                  <label className="settings-wide">
                    <span>Bio</span>
                    <textarea value={form.bio} maxLength={240} rows={4} onChange={(event) => setField('bio', event.target.value)} placeholder="A short line about you." />
                    <em>{form.bio.length}/240</em>
                  </label>
                </div>
              </section>

              <section className="settings-preview">
                <div className="settings-mini-avatar">
                  {preview ? <img src={preview} alt="" /> : <span>{initial}</span>}
                </div>
                <div>
                  <strong>{displayName}</strong>
                  <p>{form.bio || 'Your short bio appears here.'}</p>
                  {form.location ? <small>{form.location}</small> : null}
                </div>
              </section>
            </>
          )}

          {activeTab === 'Notifications' && (
            <section className="settings-card">
              <div className="settings-card-head">
                <div>
                  <p>Notifications</p>
                  <h2>Alerts & email</h2>
                </div>
                <button type="button" onClick={save} disabled={!isDirty || saving}>
                  {saving ? <Loader2 className="settings-spin" size={14} /> : <Save size={14} />}
                  Save
                </button>
              </div>

              <p className="settings-help is-block" style={{ marginTop: 0, marginBottom: 8 }}>
                Control what appears in the dashboard bell and which emails Alter AI may send when SMTP is configured.
              </p>

              {IN_APP_NOTIFICATION_GROUPS.map((group) => (
                <div key={group.title} className="settings-notif-group">
                  <h3>{group.title}</h3>
                  {group.description ? <p>{group.description}</p> : null}
                  <div className="settings-toggle-list">
                    {group.items.map(([key, label, description]) => (
                      <button
                        key={key}
                        type="button"
                        className="settings-toggle"
                        onClick={() => setNotification(key)}
                      >
                        <span>
                          {label}
                          {description ? <em className="settings-toggle-desc">{description}</em> : null}
                        </span>
                        <i className={form.notifications[key] ? 'is-on' : ''}>
                          {form.notifications[key] ? <Check size={13} /> : <X size={13} />}
                        </i>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {EMAIL_NOTIFICATION_GROUPS.map((group) => (
                <div key={group.title} className="settings-notif-group">
                  <h3>
                    <Mail size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
                    {group.title}
                  </h3>
                  {group.description ? <p>{group.description}</p> : null}
                  <div className="settings-toggle-list">
                    {group.items.map(([key, label, description]) => (
                      <button
                        key={key}
                        type="button"
                        className="settings-toggle"
                        onClick={() => setNotification(key)}
                        disabled={!form.notifications.emailAlerts && key !== 'emailAlerts'}
                      >
                        <span>
                          {label}
                          {description ? <em className="settings-toggle-desc">{description}</em> : null}
                        </span>
                        <i className={form.notifications[key] ? 'is-on' : ''}>
                          {form.notifications[key] ? <Check size={13} /> : <X size={13} />}
                        </i>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {activeTab === 'Security' && (
            <section className="settings-card">
              <div className="settings-card-head">
                <div>
                  <p>Security</p>
                  <h2>Account access</h2>
                </div>
              </div>
              <div className="settings-readonly">
                <span>Email</span>
                <strong>{user?.email || 'Not available'}</strong>
              </div>
              <div className="settings-readonly">
                <span>Sign-in provider</span>
                <strong>Managed by Supabase Auth</strong>
              </div>
              <p className="settings-help is-block">
                Passwords and OAuth connections are handled by your auth provider. Profile changes here update Alter immediately.
              </p>
            </section>
          )}
        </div>
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2400,
          style: {
            background: '#111111',
            color: '#F0EEF8',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            fontFamily: 'DM Mono, monospace',
            fontSize: 11
          }
        }}
      />
      <SettingsStyles />
    </>
  );
};

const SettingsStyles = () => (
  <style>{`
    .settings-page {
      display: grid;
      grid-template-columns: 190px minmax(0, 1fr);
      gap: 28px;
      width: min(980px, 100%);
      margin: 0 auto;
      padding: 28px 0 72px;
      color: #F0EEF8;
    }

    .settings-tabs {
      display: grid;
      align-content: start;
      gap: 8px;
    }

    .settings-tabs button,
    .settings-card-head p,
    .settings-card-head button,
    .settings-secondary-btn,
    .settings-grid span,
    .settings-grid em,
    .settings-toggle,
    .settings-readonly,
    .settings-help {
      font-family: 'DM Mono', monospace;
    }

    .settings-tabs button {
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      background: rgba(255,255,255,0.025);
      padding: 11px 12px;
      color: rgba(255,255,255,0.42);
      font-size: 10px;
      text-align: left;
      transition: 160ms ease;
    }

    .settings-tabs button.is-active,
    .settings-tabs button:hover {
      border-color: rgba(0,212,255,0.22);
      background: rgba(0,212,255,0.07);
      color: rgba(0,212,255,0.9);
    }

    .settings-content {
      min-width: 0;
    }

    .settings-card,
    .settings-preview {
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      background: rgba(255,255,255,0.025);
    }

    .settings-card {
      padding: 22px;
    }

    .settings-card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 22px;
    }

    .settings-card-head p {
      margin: 0 0 6px;
      color: rgba(255,255,255,0.34);
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .settings-card-head h2 {
      margin: 0;
      color: #fff;
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      font-style: italic;
      font-weight: 300;
    }

    .settings-card-head button,
    .settings-secondary-btn {
      display: inline-flex;
      min-height: 38px;
      align-items: center;
      justify-content: center;
      gap: 7px;
      border-radius: 9px;
      font-size: 11px;
    }

    .settings-card-head button {
      border: 1px solid rgba(0,212,255,0.28);
      background: rgba(0,212,255,0.08);
      color: rgba(0,212,255,0.9);
      padding: 0 14px;
    }

    .settings-card-head button:disabled,
    .settings-secondary-btn:disabled {
      cursor: not-allowed;
      opacity: 0.42;
    }

    .settings-avatar-row {
      display: flex;
      align-items: center;
      gap: 18px;
      margin-bottom: 24px;
    }

    .settings-avatar,
    .settings-mini-avatar {
      position: relative;
      overflow: hidden;
      border-radius: 50%;
      border: 1px solid rgba(0,212,255,0.28);
      background: rgba(255,255,255,0.06);
      flex-shrink: 0;
    }

    .settings-avatar {
      width: 88px;
      height: 88px;
    }

    .settings-mini-avatar {
      width: 44px;
      height: 44px;
    }

    .settings-avatar img,
    .settings-mini-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .settings-avatar span,
    .settings-mini-avatar span {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-style: italic;
    }

    .settings-mini-avatar span {
      font-size: 18px;
    }

    .settings-avatar-busy {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.58);
    }

    .settings-secondary-btn {
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.68);
      padding: 0 13px;
    }

    .settings-help {
      margin: 8px 0 0;
      color: rgba(255,255,255,0.32);
      font-size: 10px;
      line-height: 1.6;
    }

    .settings-help.is-block {
      max-width: 560px;
      margin-top: 18px;
      font-family: Inter, system-ui, sans-serif;
      font-size: 13px;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .settings-grid label {
      min-width: 0;
    }

    .settings-grid .settings-wide {
      grid-column: 1 / -1;
    }

    .settings-grid span {
      display: block;
      margin-bottom: 8px;
      color: rgba(255,255,255,0.36);
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .settings-grid input,
    .settings-grid textarea {
      width: 100%;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      background: rgba(255,255,255,0.035);
      color: #fff;
      outline: 0;
      font: 13px Inter, system-ui, sans-serif;
    }

    .settings-grid input {
      height: 42px;
      padding: 0 12px;
    }

    .settings-grid textarea {
      resize: vertical;
      min-height: 104px;
      padding: 11px 12px;
      line-height: 1.6;
    }

    .settings-grid input:focus,
    .settings-grid textarea:focus {
      border-color: rgba(0,212,255,0.34);
    }

    .settings-input-icon {
      position: relative;
    }

    .settings-input-icon svg {
      position: absolute;
      left: 12px;
      top: 14px;
      color: rgba(255,255,255,0.28);
    }

    .settings-input-icon input {
      padding-left: 34px;
    }

    .settings-grid em {
      display: block;
      margin-top: 6px;
      color: rgba(255,255,255,0.26);
      font-size: 9px;
      font-style: normal;
      text-align: right;
    }

    .settings-preview {
      display: flex;
      align-items: center;
      gap: 13px;
      margin-top: 14px;
      padding: 16px;
    }

    .settings-preview strong {
      display: block;
      color: #fff;
      font: 13px 'DM Mono', monospace;
      font-weight: 400;
    }

    .settings-preview p,
    .settings-preview small {
      display: block;
      margin: 4px 0 0;
      color: rgba(255,255,255,0.42);
      font: 12px/1.45 Inter, system-ui, sans-serif;
    }

    .settings-toggle-list {
      display: grid;
      gap: 10px;
    }

    .settings-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      background: rgba(255,255,255,0.025);
      padding: 14px;
      color: rgba(255,255,255,0.68);
      font-size: 11px;
      text-align: left;
      cursor: pointer;
    }

    .settings-toggle:disabled {
      opacity: 0.38;
      cursor: not-allowed;
    }

    .settings-toggle i {
      display: inline-flex;
      width: 30px;
      height: 22px;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.36);
      font-style: normal;
    }

    .settings-toggle i.is-on {
      background: rgba(5,150,105,0.16);
      color: #059669;
    }

    .settings-readonly {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      border-top: 1px solid rgba(255,255,255,0.07);
      padding: 16px 0;
      font-size: 11px;
    }

    .settings-readonly span {
      color: rgba(255,255,255,0.38);
    }

    .settings-readonly strong {
      color: rgba(255,255,255,0.78);
      font-weight: 400;
      text-align: right;
    }

    .settings-spin {
      animation: settingsSpin 1s linear infinite;
    }

    @keyframes settingsSpin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 820px) {
      .settings-page {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 22px 0 76px;
      }

      .settings-tabs {
        display: flex;
        overflow-x: auto;
      }

      .settings-tabs button {
        white-space: nowrap;
      }
    }

    @media (max-width: 620px) {
      .settings-card-head,
      .settings-avatar-row {
        align-items: stretch;
        flex-direction: column;
      }

      .settings-card-head button,
      .settings-secondary-btn {
        width: 100%;
      }

      .settings-grid {
        grid-template-columns: 1fr;
      }

      .settings-readonly {
        align-items: flex-start;
        flex-direction: column;
      }

      .settings-readonly strong {
        text-align: left;
      }
    }
  `}</style>
);

export default Settings;
