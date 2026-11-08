import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const [stats, setStats] = useState({
    total_sessions: 0,
    datasets_cleaned: 0,
    avg_dqi_improvement: null,
    ai_suggestions: 0,
  });

  const [sessions, setSessions] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [logs, setLogs] = useState([]);

  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  const [error, setError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [preferencesError, setPreferencesError] = useState("");
  const [preferencesMessage, setPreferencesMessage] = useState("");

  /*
   * Verify the authenticated user with the backend.
   */
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await api.get("/auth/me");

        setUser(response.data);

        localStorage.setItem(
          "user",
          JSON.stringify(response.data)
        );
      } catch (error) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        localStorage.removeItem("current_session");

        navigate("/login");
      }
    };

    loadCurrentUser();
  }, [navigate]);

  /*
   * Load dashboard data.
   */
  const loadDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        statsResponse,
        sessionsResponse,
        datasetsResponse,
        logsResponse,
      ] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/sessions"),
        api.get("/dashboard/datasets"),
        api.get("/dashboard/logs"),
      ]);

      setStats(statsResponse.data);
      setSessions(sessionsResponse.data);
      setDatasets(datasetsResponse.data);
      setLogs(logsResponse.data);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Unable to load dashboard data.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  /*
   * Load profile information.
   */
  const loadProfile = async () => {
    setProfileLoading(true);
    setProfileError("");

    try {
      const response = await api.get("/users/profile");
      setProfile(response.data);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Unable to load profile information.";

      setProfileError(message);
    } finally {
      setProfileLoading(false);
    }
  };

  /*
   * Load user preferences.
   */
  const loadPreferences = async () => {
    setPreferencesLoading(true);
    setPreferencesError("");
    setPreferencesMessage("");

    try {
      const response = await api.get("/users/preferences");
      setPreferences(response.data);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Unable to load preferences.";

      setPreferencesError(message);
    } finally {
      setPreferencesLoading(false);
    }
  };

  /*
   * Load profile/preferences whenever their section is opened.
   */
  useEffect(() => {
    if (activeSection === "profile") {
      loadProfile();
    }

    if (activeSection === "preferences") {
      loadPreferences();
    }
  }, [activeSection]);

  /*
   * Logout.
   */
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("current_session");

    navigate("/login");
  };

  /*
   * File selection.
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
    setError("");
  };

  /*
   * Dataset upload.
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setError("");
    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post("/api/upload", formData);

      const session = response.data;

      localStorage.setItem(
        "current_session",
        JSON.stringify(session)
      );

      setUploadResult(session);

      await loadDashboardData();
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Unable to upload the dataset. Please try again.";

      setError(message);
    } finally {
      setUploading(false);
    }
  };

  /*
   * Proceed to cleaning.
   */
  const handleProceedToCleaning = () => {
    navigate("/cleaning");
  };

  /*
   * Update a preference locally before saving.
   */
  const handlePreferenceChange = (field, value) => {
    setPreferences((current) => ({
      ...current,
      [field]: value,
    }));

    setPreferencesMessage("");
    setPreferencesError("");
  };

  /*
   * Save preferences to PostgreSQL.
   */
  const handleSavePreferences = async () => {
    if (!preferences) {
      return;
    }

    setSavingPreferences(true);
    setPreferencesError("");
    setPreferencesMessage("");

    try {
      const response = await api.put(
        "/users/preferences",
        preferences
      );

      setPreferences(response.data);

      setPreferencesMessage(
        "Preferences saved successfully."
      );
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Unable to save preferences.";

      setPreferencesError(message);
    } finally {
      setSavingPreferences(false);
    }
  };

  /*
   * Dashboard section.
   */
  const renderDashboard = () => {
    return (
      <div>
        <h1>
          Good to have you back,{" "}
          {user?.first_name || "User"}.
        </h1>

        <p>
          Upload a dataset to start a new audit, or continue a previous
          session.
        </p>

        {error && <p>{error}</p>}

        <section>
          <h2>Dashboard Statistics</h2>

          {loading ? (
            <p>Loading dashboard data...</p>
          ) : (
            <div>
              <div>
                <h3>Total Sessions</h3>
                <p>{stats.total_sessions}</p>
              </div>

              <div>
                <h3>Datasets Cleaned</h3>
                <p>{stats.datasets_cleaned}</p>
              </div>

              <div>
                <h3>Avg DQI Improvement</h3>
                <p>
                  {stats.avg_dqi_improvement !== null
                    ? `${stats.avg_dqi_improvement}%`
                    : "—"}
                </p>
              </div>

              <div>
                <h3>AI Suggestions</h3>
                <p>{stats.ai_suggestions}</p>
              </div>
            </div>
          )}
        </section>

        <hr />

        <section>
          <h2>Start a New Audit</h2>

          <input
            type="file"
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls,.json,.tsv,.jpg,.jpeg,.png,.webp,.bmp,.tiff"
          />

          {selectedFile && (
            <p>
              Selected file: <strong>{selectedFile.name}</strong>
            </p>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? "Uploading..." : "Upload Dataset"}
          </button>

          {uploadResult && (
            <div>
              <h3>Upload Successful</h3>

              <p>
                <strong>Filename:</strong>{" "}
                {uploadResult.filename}
              </p>

              <p>
                <strong>Modality:</strong>{" "}
                {uploadResult.modality}
              </p>

              <p>
                <strong>Size:</strong>{" "}
                {uploadResult.file_size_mb} MB
              </p>

              <p>
                <strong>Session ID:</strong>{" "}
                {uploadResult.session_id}
              </p>

              <button
                type="button"
                onClick={handleProceedToCleaning}
              >
                Proceed to Cleaning
              </button>
            </div>
          )}
        </section>

        <hr />

        <section>
          <h2>Recent Sessions</h2>

          {loading ? (
            <p>Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p>
              No sessions yet. Upload a dataset above to start your first
              audit.
            </p>
          ) : (
            <div>
              {sessions.map((session) => (
                <div key={session.session_id}>
                  <p>
                    <strong>{session.filename}</strong>
                  </p>

                  <p>
                    Modality: {session.modality}
                  </p>

                  <p>
                    Status: {session.status}
                  </p>

                  <p>
                    Size: {session.file_size_mb} MB
                  </p>

                  <p>
                    Created:{" "}
                    {new Date(
                      session.created_at
                    ).toLocaleString()}
                  </p>

                  <hr />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  };

  /*
   * Datasets section.
   */
  const renderDatasets = () => {
    return (
      <div>
        <h1>My Datasets</h1>

        {loading ? (
          <p>Loading datasets...</p>
        ) : datasets.length === 0 ? (
          <p>No datasets uploaded yet.</p>
        ) : (
          <div>
            {datasets.map((dataset) => (
              <div key={dataset.session_id}>
                <p>
                  <strong>{dataset.filename}</strong>
                </p>

                <p>
                  Modality: {dataset.modality}
                </p>

                <p>
                  Status: {dataset.status}
                </p>

                <p>
                  Size: {dataset.file_size_mb} MB
                </p>

                <p>
                  Created:{" "}
                  {new Date(
                    dataset.created_at
                  ).toLocaleString()}
                </p>

                <hr />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /*
   * Audit Logs section.
   */
  const renderLogs = () => {
    return (
      <div>
        <h1>Audit Logs</h1>

        {loading ? (
          <p>Loading audit logs...</p>
        ) : logs.length === 0 ? (
          <p>No audit logs yet.</p>
        ) : (
          <div>
            {logs.map((log) => (
              <div key={log.id}>
                <p>
                  <strong>Issue:</strong>{" "}
                  {log.issue_detected || "—"}
                </p>

                <p>
                  <strong>Technique:</strong>{" "}
                  {log.technique_used || "—"}
                </p>

                <p>
                  <strong>Column:</strong>{" "}
                  {log.column_name || "—"}
                </p>

                <p>
                  <strong>Rows affected:</strong>{" "}
                  {log.rows_affected ?? "—"}
                </p>

                <p>
                  <strong>AI suggested:</strong>{" "}
                  {log.ai_suggested ? "Yes" : "No"}
                </p>

                <p>
                  <strong>Timestamp:</strong>{" "}
                  {new Date(
                    log.timestamp
                  ).toLocaleString()}
                </p>

                <hr />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /*
   * Help section.
   */
  const renderHelp = () => {
    return (
      <div>
        <h1>Help</h1>

        <p>
          Upload a dataset from the Dashboard to begin a new audit.
        </p>

        <p>
          Supported tabular formats include CSV, Excel, JSON, and TSV.
        </p>

        <p>
          Supported image formats include JPG, PNG, WEBP, BMP, and TIFF.
        </p>
      </div>
    );
  };

  /*
   * Profile section.
   */
  const renderProfile = () => {
    return (
      <div>
        <h1>Profile</h1>

        {profileLoading ? (
          <p>Loading profile...</p>
        ) : profileError ? (
          <p>{profileError}</p>
        ) : profile ? (
          <div>
            <section>
              <h2>Account Information</h2>

              <p>
                <strong>Name:</strong>{" "}
                {profile.first_name || "—"}{" "}
                {profile.last_name || ""}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {profile.email}
              </p>

              <p>
                <strong>Role:</strong>{" "}
                {profile.role || "—"}
              </p>

              <p>
                <strong>Member since:</strong>{" "}
                {profile.created_at
                  ? new Date(
                      profile.created_at
                    ).toLocaleDateString()
                  : "—"}
              </p>
            </section>

            <hr />

            <section>
              <h2>Onboarding Profile</h2>

              <p>
                <strong>Persona:</strong>{" "}
                {profile.persona || "—"}
              </p>

              <p>
                <strong>Skill Level:</strong>{" "}
                {profile.skill_level || "—"}
              </p>

              <p>
                <strong>Default Modality:</strong>{" "}
                {profile.default_modality || "—"}
              </p>

              <p>
                <strong>AI Mode:</strong>{" "}
                {profile.ai_mode || "—"}
              </p>

              <p>
                <strong>Use Case:</strong>{" "}
                {profile.use_case || "—"}
              </p>
            </section>
          </div>
        ) : (
          <p>No profile information available.</p>
        )}
      </div>
    );
  };

  /*
   * Preferences section.
   */
  const renderPreferences = () => {
    return (
      <div>
        <h1>Preferences</h1>

        {preferencesLoading ? (
          <p>Loading preferences...</p>
        ) : preferencesError && !preferences ? (
          <p>{preferencesError}</p>
        ) : preferences ? (
          <div>
            <section>
              <h2>Tabular Cleaning</h2>

              <div>
                <label>
                  Numeric Imputation
                  <select
                    value={preferences.numeric_impute}
                    onChange={(event) =>
                      handlePreferenceChange(
                        "numeric_impute",
                        event.target.value
                      )
                    }
                  >
                    <option value="median">Median</option>
                    <option value="mean">Mean</option>
                    <option value="mode">Mode</option>
                  </select>
                </label>
              </div>

              <div>
                <label>
                  Categorical Imputation
                  <select
                    value={preferences.categorical_impute}
                    onChange={(event) =>
                      handlePreferenceChange(
                        "categorical_impute",
                        event.target.value
                      )
                    }
                  >
                    <option value="mode">Mode</option>
                    <option value="most_frequent">
                      Most Frequent
                    </option>
                  </select>
                </label>
              </div>

              <div>
                <label>
                  Outlier Method
                  <select
                    value={preferences.outlier_method}
                    onChange={(event) =>
                      handlePreferenceChange(
                        "outlier_method",
                        event.target.value
                      )
                    }
                  >
                    <option value="iqr">IQR</option>
                    <option value="zscore">Z-Score</option>
                  </select>
                </label>
              </div>

              <div>
                <label>
                  Outlier Action
                  <select
                    value={preferences.outlier_action}
                    onChange={(event) =>
                      handlePreferenceChange(
                        "outlier_action",
                        event.target.value
                      )
                    }
                  >
                    <option value="flag">Flag</option>
                    <option value="remove">Remove</option>
                  </select>
                </label>
              </div>

              <div>
                <label>
                  Automatically Fix Data Types{" "}
                  <input
                    type="checkbox"
                    checked={preferences.auto_fix_types}
                    onChange={(event) =>
                      handlePreferenceChange(
                        "auto_fix_types",
                        event.target.checked
                      )
                    }
                  />
                </label>
              </div>

              <div>
                <label>
                  Duplicate Action
                  <select
                    value={preferences.duplicate_action}
                    onChange={(event) =>
                      handlePreferenceChange(
                        "duplicate_action",
                        event.target.value
                      )
                    }
                  >
                    <option value="ask">Ask</option>
                    <option value="remove">Remove</option>
                    <option value="flag">Flag</option>
                  </select>
                </label>
              </div>
            </section>

            <hr />

            <section>
              <h2>Report Preferences</h2>

              <div>
                <label>
                  PDF Language
                  <select
                    value={preferences.pdf_language}
                    onChange={(event) =>
                      handlePreferenceChange(
                        "pdf_language",
                        event.target.value
                      )
                    }
                  >
                    <option value="simple">Simple</option>
                    <option value="technical">Technical</option>
                  </select>
                </label>
              </div>
            </section>

            <hr />

            <section>
              <h2>Image Preferences</h2>

              <div>
                <label>
                  Blur Threshold
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={preferences.blur_threshold}
                    onChange={(event) =>
                      handlePreferenceChange(
                        "blur_threshold",
                        Number(event.target.value)
                      )
                    }
                  />
                </label>
              </div>
            </section>

            {preferencesError && (
              <p>{preferencesError}</p>
            )}

            {preferencesMessage && (
              <p>{preferencesMessage}</p>
            )}

            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={savingPreferences}
            >
              {savingPreferences
                ? "Saving..."
                : "Save Preferences"}
            </button>
          </div>
        ) : (
          <p>No preferences available.</p>
        )}
      </div>
    );
  };

  return (
    <div>
      <header>
        <h1>Dr. Data</h1>

        <nav>
          <button
            type="button"
            onClick={() => setActiveSection("dashboard")}
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("datasets")}
          >
            Datasets
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("logs")}
          >
            Audit Logs
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("help")}
          >
            Help
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("profile")}
          >
            Profile
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("preferences")}
          >
            Preferences
          </button>

          <button
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </header>

      <main>
        {activeSection === "dashboard" && renderDashboard()}

        {activeSection === "datasets" && renderDatasets()}

        {activeSection === "logs" && renderLogs()}

        {activeSection === "help" && renderHelp()}

        {activeSection === "profile" && renderProfile()}

        {activeSection === "preferences" && renderPreferences()}
      </main>
    </div>
  );
}

export default Dashboard;