import React, { useState, useEffect } from "react";
import { X, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { httpClient } from "../api/httpClient";

// Predefined options
const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" }
];

const QUALIFICATION_OPTIONS = [
  { value: "high_school", label: "High School (10th)" },
  { value: "intermediate", label: "Intermediate (12th)" },
  { value: "undergraduate_pursuing", label: "Pursuing Undergraduation" },
  { value: "undergraduate_completed", label: "Completed Graduation" },
  { value: "post_graduate_pursuing", label: "Pursuing Post Graduation" },
  { value: "post_graduate_completed", label: "Completed Post Graduation" },
  { value: "phd", label: "PhD" },
  { value: "diploma", label: "Diploma" },
  { value: "other", label: "Other" }
];

const SECTION_OPTIONS = [
  { value: "academic", label: "Academic" },
  { value: "working_professional", label: "Working Professional" },
  { value: "student", label: "Student" },
  { value: "researcher", label: "Researcher" },
  { value: "other", label: "Other" }
];

const COMMON_LANGUAGES = [
  "Hindi", "English", "Bengali", "Telugu", "Marathi", "Tamil", "Urdu", 
  "Gujarati", "Kannada", "Odia", "Malayalam", "Punjabi", "Sanskrit",
  "Assamese", "Maithili", "Meitei", "Santali", "Kashmiri", "Nepali",
  "French", "Spanish", "German", "Chinese", "Arabic", "Japanese"
];

export const ProfileInfoModal = ({
  isOpen,
  onClose,
  onSuccess,
  userDetail = null
}) => {
  const [formData, setFormData] = useState({
    fullname: "",
    age: "",
    gender: "",
    motherTongue: [],
    languagesKnown: [],
    highestQualification: "",
    section: "",
    residence: "",
  });

  const [newMotherTongue, setNewMotherTongue] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [showMotherTongueDropdown, setShowMotherTongueDropdown] = useState(false);
  const [showLanguagesDropdown, setShowLanguagesDropdown] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Initialize form with userDetail if available
  useEffect(() => {
    if (userDetail) {
      setFormData({
        fullname: userDetail.fullname || "",
        age: userDetail.age || "",
        gender: userDetail.gender || "",
        motherTongue: userDetail.motherTongue?.map(item => item.name) || [],
        languagesKnown: userDetail.languagesKnown?.map(item => item.name) || [],
        highestQualification: userDetail.highestQualification || "",
        section: userDetail.section || "",
        residence: userDetail.residence || "",
      });
    }
  }, [userDetail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMotherTongue = (language) => {
    if (language && !formData.motherTongue.includes(language)) {
      setFormData(prev => ({
        ...prev,
        motherTongue: [...prev.motherTongue, language]
      }));
    }
    setNewMotherTongue("");
  };

  const handleRemoveMotherTongue = (languageToRemove) => {
    setFormData(prev => ({
      ...prev,
      motherTongue: prev.motherTongue.filter(lang => lang !== languageToRemove)
    }));
  };

  const handleAddLanguage = (language) => {
    if (language && !formData.languagesKnown.includes(language)) {
      setFormData(prev => ({
        ...prev,
        languagesKnown: [...prev.languagesKnown, language]
      }));
    }
    setNewLanguage("");
  };

  const handleRemoveLanguage = (languageToRemove) => {
    setFormData(prev => ({
      ...prev,
      languagesKnown: prev.languagesKnown.filter(lang => lang !== languageToRemove)
    }));
  };

  const handleCustomMotherTongue = () => {
    if (newMotherTongue.trim()) {
      handleAddMotherTongue(newMotherTongue.trim());
    }
  };

  const handleCustomLanguage = () => {
    if (newLanguage.trim()) {
      handleAddLanguage(newLanguage.trim());
    }
  };

  const validateForm = () => {
    // Required fields validation
    if (!formData.fullname.trim()) {
      return "Full name is required";
    }
    
    const ageNum = parseInt(formData.age);
    if (!formData.age || ageNum < 1 || ageNum > 120) {
      return "Please enter a valid age between 1 and 120";
    }
    
    if (!formData.gender) {
      return "Please select your gender";
    }
    
    if (formData.motherTongue.length === 0) {
      return "Please add at least one mother tongue language";
    }
    
    if (formData.languagesKnown.length === 0) {
      return "Please add at least one known language";
    }
    
    if (!formData.highestQualification) {
      return "Please select your highest qualification";
    }
    
    if (!formData.residence.trim()) {
      return "Please enter your place of residence";
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSubmitting(true);
    
    try {
      // Format data according to backend schema
      const formattedData = {
        fullname: formData.fullname.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        motherTongue: formData.motherTongue.map(name => ({ name })),
        languagesKnown: formData.languagesKnown.map(name => ({ name })),
        highestQualification: formData.highestQualification,
        section: formData.section || undefined, // Optional field
        residence: formData.residence.trim(),
      };

      const endpoint = userDetail ? 'users/update-detail' : 'users/create-detail';
      await httpClient.post(endpoint, formattedData);

      if (onSuccess) {
        onSuccess();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.response?.data?.message || "Failed to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'motherTongue') {
        handleCustomMotherTongue();
      } else {
        handleCustomLanguage();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 relative animate-fade-in mx-4 max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <div className="flex items-center space-x-2 text-yellow-600 mb-4 p-3 bg-yellow-50 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">
            {userDetail 
              ? "Update your profile information"
              : "Please complete your profile to start the test"}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {userDetail ? "Update Profile" : "Complete Your Profile"}
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {userDetail 
            ? "Update your details below"
            : "Please provide your details to begin the assessment"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Age */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Age *
            </label>
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

          {/* Gender */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-white mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Gender</option>
              {GENDER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mother Tongue */}
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Mother Tongue *
            </label>
            <div className="relative">
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={newMotherTongue}
                  onChange={(e) => setNewMotherTongue(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'motherTongue')}
                  placeholder="Type or select from dropdown"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowMotherTongueDropdown(!showMotherTongueDropdown)}
                  className="px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {showMotherTongueDropdown ? <ChevronUp /> : <ChevronDown />}
                </button>
                <button
                  type="button"
                  onClick={handleCustomMotherTongue}
                  className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              
              {/* Language Dropdown */}
              {showMotherTongueDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {COMMON_LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        handleAddMotherTongue(lang);
                        setShowMotherTongueDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Selected Mother Tongues */}
            {formData.motherTongue.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.motherTongue.map(lang => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => handleRemoveMotherTongue(lang)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Languages Known */}
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Languages Known *
            </label>
            <div className="relative">
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'language')}
                  placeholder="Type or select from dropdown"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowLanguagesDropdown(!showLanguagesDropdown)}
                  className="px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {showLanguagesDropdown ? <ChevronUp /> : <ChevronDown />}
                </button>
                <button
                  type="button"
                  onClick={handleCustomLanguage}
                  className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              
              {/* Language Dropdown */}
              {showLanguagesDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {COMMON_LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        handleAddLanguage(lang);
                        setShowLanguagesDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Selected Languages */}
            {formData.languagesKnown.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.languagesKnown.map(lang => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(lang)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Highest Qualification */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Highest Qualification *
            </label>
            <select
              name="highestQualification"
              value={formData.highestQualification}
              onChange={handleChange}
              className="w-full bg-white mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Qualification</option>
              {QUALIFICATION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Section (Optional) */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Section (Optional)
            </label>
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="w-full bg-white mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Section</option>
              {SECTION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Residence */}
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
                <span>{userDetail ? "Updating..." : "Saving..."}</span>
              </>
            ) : (
              <span>{userDetail ? "Update Profile" : "Save Profile & Start Test"}</span>
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