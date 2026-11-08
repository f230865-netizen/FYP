import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Onboarding() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    persona: "",
    skill_level: "",
    default_modality: "",
    ai_mode: "",
    use_case: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/users/onboarding", formData);

      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const user = JSON.parse(storedUser);

        user.is_new_user = false;

        localStorage.setItem("user", JSON.stringify(user));
      }

      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Unable to save your onboarding information. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Dr. Data</h1>
      <h2>Welcome to Dr. Data</h2>

      <p>Tell us a little about yourself so we can personalize your experience.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="persona">Who are you?</label>

          <select
            id="persona"
            name="persona"
            value={formData.persona}
            onChange={handleChange}
            required
          >
            <option value="">Select an option</option>
            <option value="student">Student</option>
            <option value="researcher">Researcher</option>
            <option value="data_scientist">Data Scientist</option>
            <option value="developer">Developer</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="skill_level">Data skill level</label>

          <select
            id="skill_level"
            name="skill_level"
            value={formData.skill_level}
            onChange={handleChange}
            required
          >
            <option value="">Select your skill level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label htmlFor="default_modality">Default dataset type</label>

          <select
            id="default_modality"
            name="default_modality"
            value={formData.default_modality}
            onChange={handleChange}
            required
          >
            <option value="">Select dataset type</option>
            <option value="tabular">Tabular</option>
            <option value="image">Image</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div>
          <label htmlFor="ai_mode">AI assistance</label>

          <select
            id="ai_mode"
            name="ai_mode"
            value={formData.ai_mode}
            onChange={handleChange}
            required
          >
            <option value="">Select AI preference</option>
            <option value="minimal">Minimal assistance</option>
            <option value="balanced">Balanced assistance</option>
            <option value="full">Full assistance</option>
          </select>
        </div>

        <div>
          <label htmlFor="use_case">Primary use case</label>

          <select
            id="use_case"
            name="use_case"
            value={formData.use_case}
            onChange={handleChange}
            required
          >
            <option value="">Select your primary use case</option>
            <option value="academic">Academic / University</option>
            <option value="research">Research</option>
            <option value="business">Business</option>
            <option value="personal">Personal projects</option>
            <option value="other">Other</option>
          </select>
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Continue to Dashboard"}
        </button>
      </form>
    </div>
  );
}

export default Onboarding;
