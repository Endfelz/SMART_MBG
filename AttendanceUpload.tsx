'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { attendanceAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Camera, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface AttendanceUploadProps {
  onSuccess?: () => void;
}

export default function AttendanceUpload({ onSuccess }: AttendanceUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Pilih foto terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await attendanceAPI.upload(formData);
      setResult(response.attendance);
      toast.success(response.message || 'Foto berhasil diupload!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HABIS':
        return (
          <span className="badge badge-success">
            <CheckCircle className="w-4 h-4 mr-1" />
            Habis
          </span>
        );
      case 'SISA_SEDIKIT':
        return (
          <span className="badge badge-warning">
            <AlertCircle className="w-4 h-4 mr-1" />
            Sisa Sedikit
          </span>
        );
      case 'SISA_BANYAK':
        return (
          <span className="badge badge-error">
            <AlertCircle className="w-4 h-4 mr-1" />
            Sisa Banyak
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className="badge badge-info">
            <Loader className="w-4 h-4 mr-1 animate-spin" />
            Menunggu Verifikasi
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
        <Camera className="w-6 h-6 mr-2 text-primary-600" />
        Absen Makan MBG
      </h2>

      <div className="space-y-6">
        {/* Upload Area */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Upload Foto Piring <span className="text-red-500">*</span>
            <span className="text-xs text-neutral-500 ml-2">(tanpa wajah, maksimal 5MB)</span>
          </label>
          
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 mb-2">Klik untuk memilih foto</p>
              <p className="text-sm text-neutral-500">JPEG, PNG, atau WebP</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-lg border border-neutral-200"
              />
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setResult(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-neutral-700">Status Deteksi:</span>
              {getStatusBadge(result.status)}
            </div>
            {result.confidence && (
              <p className="text-sm text-neutral-600">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </p>
            )}
            {result.needsVerification && (
              <p className="text-sm text-yellow-600 mt-2">
                ⚠️ Foto memerlukan verifikasi dari guru
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="btn btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Mengupload...
            </span>
          ) : (
            'Upload Foto'
          )}
        </button>

        {/* Info */}
        <div className="p-4 bg-secondary-50 rounded-lg border border-secondary-200">
          <p className="text-sm text-secondary-800">
            <strong>Tips:</strong> Pastikan foto hanya menampilkan piring, tanpa wajah. 
            Foto akan dianalisis oleh AI untuk mendeteksi sisa makanan.
          </p>
        </div>
      </div>
    </div>
  );
}

