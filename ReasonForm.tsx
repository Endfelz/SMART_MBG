'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { attendanceAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle } from 'lucide-react';

const reasonSchema = z.object({
  reasonType: z.enum(['PORSI_BANYAK', 'RASA_TIDAK_COCOK', 'MENU_TIDAK_DISUKAI', 'KONDISI_KESEHATAN', 'LAINNYA']),
  reasonText: z.string().max(500, 'Maksimal 500 karakter').optional(),
}).refine((data) => {
  if (data.reasonType === 'LAINNYA' && !data.reasonText) {
    return false;
  }
  return true;
}, {
  message: 'Alasan diperlukan untuk pilihan "Lainnya"',
  path: ['reasonText'],
});

type ReasonForm = z.infer<typeof reasonSchema>;

interface ReasonFormProps {
  attendanceId: string;
  onSuccess?: () => void;
}

const REASON_OPTIONS = [
  { value: 'PORSI_BANYAK', label: 'Porsi terlalu banyak', icon: '🍽️' },
  { value: 'RASA_TIDAK_COCOK', label: 'Rasa tidak cocok', icon: '😕' },
  { value: 'MENU_TIDAK_DISUKAI', label: 'Menu tidak disukai', icon: '👎' },
  { value: 'KONDISI_KESEHATAN', label: 'Kondisi kesehatan', icon: '🏥' },
  { value: 'LAINNYA', label: 'Lainnya', icon: '📝' },
];

export default function ReasonForm({ attendanceId, onSuccess }: ReasonFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReasonForm>({
    resolver: zodResolver(reasonSchema),
  });

  const reasonType = watch('reasonType');

  const onSubmit = async (data: ReasonForm) => {
    setLoading(true);
    try {
      await attendanceAPI.submitReason(attendanceId, {
        reasonType: data.reasonType,
        reasonText: data.reasonText,
      });
      toast.success('Alasan berhasil disimpan');
      setSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="card">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Alasan Berhasil Disimpan
            </h3>
            <p className="text-neutral-600">
              Terima kasih atas feedback Anda
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center">
        <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
        Alasan Makanan Tidak Habis
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Reason Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Pilih Alasan <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {REASON_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  reasonType === option.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('reasonType')}
                  className="sr-only"
                />
                <span className="text-2xl mr-3">{option.icon}</span>
                <span className="flex-1 font-medium text-neutral-900">
                  {option.label}
                </span>
                {reasonType === option.value && (
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                )}
              </label>
            ))}
          </div>
          {errors.reasonType && (
            <p className="mt-2 text-sm text-red-600">{errors.reasonType.message}</p>
          )}
        </div>

        {/* Reason Text (for LAINNYA) */}
        {reasonType === 'LAINNYA' && (
          <div>
            <label htmlFor="reasonText" className="block text-sm font-medium text-neutral-700 mb-2">
              Jelaskan Alasan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reasonText"
              {...register('reasonText')}
              rows={4}
              className={`input ${errors.reasonText ? 'input-error' : ''}`}
              placeholder="Tuliskan alasan mengapa makanan tidak habis..."
            />
            {errors.reasonText && (
              <p className="mt-1 text-sm text-red-600">{errors.reasonText.message}</p>
            )}
            <p className="mt-1 text-xs text-neutral-500">
              Maksimal 500 karakter
            </p>
          </div>
        )}

        {/* Info */}
        {reasonType === 'KONDISI_KESEHATAN' && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> Alasan kondisi kesehatan tidak akan mengurangi poin Anda.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Menyimpan...' : 'Simpan Alasan'}
        </button>
      </form>
    </div>
  );
}

