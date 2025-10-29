import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";

export const ProfileInfoModal = ({
  isOpen,
  onClose,
  onSubmit,
  forceOpen = false,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    motherTongue: "",
    languages: "",
    qualification: "",
    section: "",
    residence: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validate all required fields
    const requiredFields = ['fullName', 'age', 'gender', 'motherTongue', 'languages', 'qualification', 'residence'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      setError("Please fill in all required fields before starting the test.");
      return;
    }
    
    // Validate age
    const age = parseInt(formData.age);
    if (age < 1 || age > 120) {
      setError("Please enter a valid age between 1 and 120.");
      return;
    }

    setError("");
    setSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 relative animate-fade-in mx-4 max-h-[90vh] overflow-y-auto">
        {!forceOpen && (
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        )}

        {forceOpen && (
          <div className="flex items-center space-x-2 text-yellow-600 mb-4 p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              Please complete your profile to start the test
            </span>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Complete Your Profile
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Please provide your details to begin the assessment
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Age *</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="1"
              max="120"
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your age"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-white mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Mother Tongue *</label>
            <input
              type="text"
              name="motherTongue"
              value={formData.motherTongue}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="E.g., Hindi, Tamil, Bengali"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Languages Known *</label>
            <input
              type="text"
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="E.g., English, Hindi, French"
              required
            />
          </div>

          

          <div>
            <label className="text-sm font-medium text-gray-700">Qualification *</label>
            <select
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className="w-full bg-white mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Qualification</option>
              <option value="male">Pursuing Undergraduation</option>
              <option value="female">Completed Graduation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Section</label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="E.g., A / B / C"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Place of Residence (As per Aadhaar) *
            </label>
            <input
              type="text"
              name="residence"
              value={formData.residence}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your complete address"
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm mt-4 text-center bg-red-50 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-xl transition-all flex items-center space-x-2 min-w-[200px] justify-center"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Profile & Start Test</span>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          * Required fields must be filled to proceed with the test
        </p>
      </div>
    </div>
  );
};