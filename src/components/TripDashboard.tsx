import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, CheckCircle2, Clock, Plus, Pencil, Archive, Copy, Trash2 } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { TripModal } from './TripModal';
import { DeleteTripModal } from './DeleteTripModal';
import { Trip } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function TripDashboard() {
  const { trips, setActiveTrip, updateTripStatus, deleteTrip } = useTripStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTrip, setEditTrip] = useState<Trip | undefined>();
  const [duplicateTrip, setDuplicateTrip] = useState<Trip | undefined>();
  const [tripToDelete, setTripToDelete] = useState<Trip | undefined>();

  const activeTrips = trips.filter((trip) => trip.status === 'active');
  const completedTrips = trips.filter((trip) => trip.status === 'completed');

  const handleEditClick = (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation();
    setEditTrip(trip);
    setDuplicateTrip(undefined);
    setIsModalOpen(true);
  };

  const handleDuplicateClick = (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation();
    setDuplicateTrip(trip);
    setEditTrip(undefined);
    setIsModalOpen(true);
  };

  const handleArchiveClick = (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation();
    updateTripStatus(trip.id, trip.status === 'active' ? 'completed' : 'active');
  };

  const handleDeleteClick = (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation();
    setTripToDelete(trip);
  };

  const handleConfirmDelete = async () => {
    if (tripToDelete) {
      await deleteTrip(tripToDelete.id);
      setTripToDelete(undefined);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditTrip(undefined);
    setDuplicateTrip(undefined);
  };

  const TripCard = ({ trip, index }: { trip: Trip; index: number }) => (
    <div
      key={`${trip.id}-${index}`}
      onClick={() => setActiveTrip(trip.id)}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{trip.name}</h3>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              trip.status === 'active'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {trip.status === 'active' ? (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <CheckCircle2 size={14} />
                Completed
              </span>
            )}
          </span>
          <button
            onClick={(e) => handleDuplicateClick(e, trip)}
            className="p-1 hover:bg-gray-100 rounded-full"
            title="Duplicate Trip"
          >
            <Copy size={14} className="text-gray-600" />
          </button>
          <button
            onClick={(e) => handleArchiveClick(e, trip)}
            className="p-1 hover:bg-gray-100 rounded-full"
            title={trip.status === 'active' ? 'Archive Trip' : 'Reactivate Trip'}
          >
            <Archive size={14} className="text-gray-600" />
          </button>
          <button
            onClick={(e) => handleEditClick(e, trip)}
            className="p-1 hover:bg-gray-100 rounded-full"
            title="Edit Trip"
          >
            <Pencil size={14} className="text-gray-600" />
          </button>
          <button
            onClick={(e) => handleDeleteClick(e, trip)}
            className="p-1 hover:bg-gray-100 rounded-full text-red-600"
            title="Delete Trip"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-600 mb-2">
        <Calendar size={16} />
        <span>
          {format(new Date(trip.startDate), 'MMM d')} -{' '}
          {format(new Date(trip.endDate), 'MMM d, yyyy')}
        </span>
      </div>

      {trip.notes && (
        <div className="mt-2 text-sm text-gray-600 line-clamp-2">
          {trip.notes}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Duration</span>
          <span className="font-medium text-gray-800">
            {trip.days.length} days
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">My Trips</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} />
          New Trip
        </button>
      </div>

      {activeTrips.length > 0 && (
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Trips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTrips.map((trip, index) => (
              <TripCard key={`active-${trip.id}-${index}`} trip={trip} index={index} />
            ))}
          </div>
        </div>
      )}

      {completedTrips.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Completed Trips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTrips.map((trip, index) => (
              <TripCard key={`completed-${trip.id}-${index}`} trip={trip} index={index} />
            ))}
          </div>
        </div>
      )}

      {trips.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No trips yet. Create your first trip to get started!</p>
        </div>
      )}

      <TripModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        editTrip={editTrip}
        duplicateTrip={duplicateTrip}
      />

      {tripToDelete && (
        <DeleteTripModal
          isOpen={true}
          onClose={() => setTripToDelete(undefined)}
          onConfirm={handleConfirmDelete}
          trip={tripToDelete}
        />
      )}
    </div>
  );
}