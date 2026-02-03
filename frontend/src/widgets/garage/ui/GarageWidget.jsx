import React, { useState, useEffect } from "react";
import AddVehicleForm from "../../../features/garage/add-vehicle/ui/AddVehicleForm.jsx";
import {
  getGarageVehicles,
  addVehicleToGarage } from
"../../../shared/api/garage.js";


function VehicleItem({ vehicle, onRemove }) {
  return (
    <div className="group relative bg-gradient-to-r from-slate-50 to-white border border-slate-200 hover:border-blue-300 rounded-xl p-4 transition-all duration-200 hover:shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1"></div>
                    <h4 className="font-semibold text-slate-900 truncate">
                        {vehicle.make.make_name} {vehicle.model.model_name}
                    </h4>
                    <p className="text-sm text-slate-600 flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {vehicle.year} год
                        </span>
                        {vehicle.vin &&
            <span className="flex items-center gap-1 text-xs">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                VIN: {vehicle.vin}
                            </span>
            }
                    </p>
                    {vehicle.comment &&
          <p className="text-xs text-slate-500 mt-2 italic">"{vehicle.comment}"</p>
          }
                </div>
                <button
          onClick={() => onRemove(vehicle)}
          className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all duration-200">

                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>);

}


export default function GarageWidget({ onVehicleAdded, onVehicleRemoved }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);


  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGarageVehicles();
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setVehicles(items);
    } catch (err) {
      console.error('Failed to load garage vehicles:', err);
      setError("Не удалось загрузить автомобили.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (vehicleData) => {
    try {
      setAddingVehicle(true);
      const newVehicle = await addVehicleToGarage(vehicleData);

      await loadVehicles();
      setShowAddForm(false);


      if (onVehicleAdded) {
        onVehicleAdded(newVehicle);
      }
    } catch (err) {
      console.error('Failed to add vehicle:', err);
    } finally {
      setAddingVehicle(false);
    }
  };

  const handleRemoveVehicle = async (vehicleToRemove) => {





    setVehicles((prev) => prev.filter((v) => v.id !== vehicleToRemove.id));


    if (onVehicleRemoved) {
      onVehicleRemoved(vehicleToRemove);
    }
  };

  const vehicleCount = vehicles.length;
  const vehicleCountText = () => {
    if (vehicleCount === 0) return "Добавьте ваши автомобили";
    if (vehicleCount === 1) return "1 автомобиль";
    if (vehicleCount > 1 && vehicleCount < 5) return `${vehicleCount} автомобиля`;
    return `${vehicleCount} автомобилей`;
  };


  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Мой гараж</h3>
                            <p className="text-sm text-slate-600">{vehicleCountText()}</p>
                        </div>
                    </div>
                    <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">

                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Добавить
                    </button>
                </div>
            </div>

            {}
            <div className="p-6">
                {showAddForm &&
        <div className="mb-6">
                        <AddVehicleForm
            onSubmit={handleAddVehicle}
            onCancel={() => setShowAddForm(false)}
            loading={addingVehicle} />

                    </div>
        }

                {loading &&
        <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
        }

                {!loading && error && <div className="text-center text-red-600">{error}</div>}

                {!loading && !error && vehicleCount === 0 &&
        <div className="text-center py-8">
                        <h4 className="font-medium text-slate-900 mb-2">Гараж пуст</h4>
                        <p className="text-sm text-slate-600 mb-4">Добавьте авто для персональных рекомендаций</p>
                    </div>
        }
                
                {!loading && !error && vehicleCount > 0 &&
        <div className="space-y-3">
                        {vehicles.map((vehicle) =>
          <VehicleItem key={vehicle.id} vehicle={vehicle} onRemove={handleRemoveVehicle} />
          )}
                    </div>
        }
            </div>
        </div>);

}