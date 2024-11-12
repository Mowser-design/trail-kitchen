import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Trip } from '../types';

interface DeleteTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  trip: Trip;
}

export function DeleteTripModal({ isOpen, onClose, onConfirm, trip }: DeleteTripModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Delete Trip</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4 mx-auto">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-center text-gray-600 mb-2">
            Are you sure you want to delete <span className="font-semibold">{trip.name}</span>?
          </p>
          <p className="text-center text-sm text-gray-500">
            This action cannot be undone. All trip data will be permanently removed.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete Trip
          </button>
        </div>
      </div>
    </div>
  );
}