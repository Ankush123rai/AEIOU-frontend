import React, { useMemo, useRef, useState } from 'react';
import { Layout } from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, Link as LinkIcon, ChevronRight, CheckCircle } from 'lucide-react';
import { useExam } from '../../hooks/useExam';
import { apiClient, ExamTask } from '../../services/client';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';

type Method = 'photo' | 'drive';

export function WritingModule() {
  const { currentExam, getModule } = useExam();
  const navigate = useNavigate();
  const writeMod = getModule('writing');

  // multiple writing tasks possible
  const tasks = useMemo<ExamTask[]>(
    () => (writeMod?.taskIds || []).filter(t => t.isActive !== false),
    [writeMod]
  );

  // Track file uploads & links per task
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [driveLinks, setDriveLinks] = useState<Record<string, string>>({});
  const [uploadMethod, setUploadMethod] = useState<Method>('photo');
  const [isUploading, setIsUploading] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFile = (taskId: string, f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      alert('File must be less than 10MB');
      return;
    }
    if (!f.type.startsWith('image/')) {
      alert('Upload an image (JPG/PNG/HEIC)');
      return;
    }
    setUploadedFiles(prev => ({ ...prev, [taskId]: f }));
  };

  const canSubmit = () => {
    if (uploadMethod === 'photo') {
      return tasks.every(t => uploadedFiles[t._id]);
    }
    if (uploadMethod === 'drive') {
      return tasks.every(t => driveLinks[t._id]?.trim());
    }
    return false;
  };

  const submitNow = async () => {
    if (!currentExam) return;
    if (!canSubmit()) {
      alert('Please complete all writing tasks before submitting.');
      return;
    }

    setIsUploading(true);

    if (uploadMethod === 'drive') {
      const responses = tasks.map(t => ({
        taskId: t._id,
        answer: `Drive Link: ${driveLinks[t._id]}`
      }));
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      };
  
      const res = await axios.post(
        `${API_BASE_URL}/api/submissions`,
        {
          examId: currentExam._id,
          module: "reading",
          responses,
        },
        headers
      );
  
      navigate("/dashboard");
      setIsUploading(false);
      return;
    }

    if (uploadMethod === 'photo') {
      const fd = new FormData();
      fd.append('examId', currentExam._id);
      fd.append('module', 'writing');
      const responses = tasks.map(t => ({
        taskId: t._id,
        answer: 'photo'
      }));
      fd.append('responses', JSON.stringify(responses));

      tasks.forEach(t => {
        const file = uploadedFiles[t._id];
        if (file) fd.append('files', file, file.name);
      });

      await apiClient.submitMedia(fd);
      setIsUploading(false);
      navigate('/dashboard');
    }
  };

  return (
    <Layout title="Writing Module">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-poppins font-bold text-gray-900">Writing Assessment</h2>
            <div className="text-sm text-gray-600 font-inter">
              Time limit: {writeMod?.durationMinutes ?? 30} mins
            </div>
          </div>

          {/* Upload Method Selection */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-poppins font-bold text-gray-900">Submission Method</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setUploadMethod('photo')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  uploadMethod === 'photo'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Camera className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                <div className="text-center">
                  <h4 className="font-inter font-medium text-gray-900">Upload Photo</h4>
                  <p className="text-sm text-gray-600">Take a photo of your written response</p>
                </div>
              </button>

              {/* <button
                onClick={() => setUploadMethod('drive')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  uploadMethod === 'drive'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <LinkIcon className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                <div className="text-center">
                  <h4 className="font-inter font-medium text-gray-900">Google Drive</h4>
                  <p className="text-sm text-gray-600">Paste a shareable link</p>
                </div>
              </button> */}
            </div>
          </div>

          {tasks.map((t, idx) => (
            <div
              key={t._id}
              className="border border-gray-200 rounded-xl p-6 mb-8 bg-gray-50"
            >
              <h3 className="text-lg font-poppins font-bold text-gray-900 mb-3">
                {`${idx + 1}. ${t.title}`}
              </h3>
              <p className="whitespace-pre-line text-gray-800 font-inter leading-relaxed mb-6">
                {t.instruction}
              </p>

              {/* Upload or Drive Input */}
              {uploadMethod === 'photo' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    {uploadedFiles[t._id] ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          {isUploading ? (
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle className="w-12 h-12 text-secondary-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-inter font-medium text-gray-900">{uploadedFiles[t._id]?.name}</p>
                          <p className="text-sm text-gray-600">
                            {isUploading ? 'Uploading...' : 'Ready to submit'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <button
                          onClick={() => fileRefs.current[t._id]?.click()}
                          className="bg-primary-900 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors"
                        >
                          Choose File
                        </button>
                        <p className="mt-2 text-sm text-gray-600">
                          or drag and drop your image here
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supported: JPG, PNG, HEIC (max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={(el) => (fileRefs.current[t._id] = el)}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(t._id, f);
                    }}
                  />
                </div>
              )}

              {uploadMethod === 'drive' && (
                <div className="space-y-2">
                  <label className="text-lg font-poppins font-bold text-gray-900">
                    Google Drive Link
                  </label>
                  <input
                    type="url"
                    value={driveLinks[t._id] || ''}
                    onChange={(e) =>
                      setDriveLinks(prev => ({ ...prev, [t._id]: e.target.value }))
                    }
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                  />
                  <p className="text-sm text-gray-600 font-inter">
                    Ensure link access is set to <strong>Anyone with the link can view</strong>.
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Submit */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <div className="text-sm text-gray-600 font-inter">
              Your response will be saved when you submit
            </div>
            <button
              onClick={submitNow}
              disabled={!canSubmit() || isUploading}
              className="flex text-xs sm:text-base items-center space-x-2 bg-primary-900 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors disabled:opacity-50"
            >
              <span>{isUploading ? 'Submitting...' : 'Submit & Complete'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
