import React, { useEffect, useState } from "react";
import { getVehicleMakes, getVehicleModels, getVehicleYears } from "../../../api/api.js";

// AddVehicleForm component for adding vehicles to garage
export default function AddVehicleForm({ onSubmit, onCancel, loading }) {
	const [formData, setFormData] = useState({
		make_id: '',
		model_id: '',
		year: '',
		vin: '',
		comment: ''
	});
	const [errors, setErrors] = useState({});

	// Remote collections
	const [makes, setMakes] = useState([]);
	const [models, setModels] = useState([]);
	const [years, setYears] = useState([]);

	// Loading flags
	const [loadingMakes, setLoadingMakes] = useState(false);
	const [loadingModels, setLoadingModels] = useState(false);
	const [loadingYears, setLoadingYears] = useState(false);

	// Fetch makes on mount
	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				setLoadingMakes(true);
				const data = await getVehicleMakes({ limit: 100 });
				if (isMounted) setMakes(data || []);
			} catch (e) {
				console.error('Failed to load makes', e);
			} finally {
				if (isMounted) setLoadingMakes(false);
			}
		})();
		return () => { isMounted = false; };
	}, []);

	// Fetch models when make selected
	useEffect(() => {
		let isMounted = true;
		(async () => {
			if (!formData.make_id) { setModels([]); return; }
			try {
				setLoadingModels(true);
				const data = await getVehicleModels({ limit: 50, make_id: parseInt(formData.make_id) });
				if (isMounted) setModels(data || []);
			} catch (e) {
				console.error('Failed to load models', e);
			} finally {
				if (isMounted) setLoadingModels(false);
			}
		})();
		return () => { isMounted = false; };
	}, [formData.make_id]);

	// Fetch years when model selected
	useEffect(() => {
		let isMounted = true;
		(async () => {
			if (!formData.model_id) { setYears([]); return; }
			try {
				setLoadingYears(true);
				const data = await getVehicleYears({ model_id: parseInt(formData.model_id) });
				if (isMounted) setYears(Array.isArray(data) ? data : []);
			} catch (e) {
				console.error('Failed to load years', e);
			} finally {
				if (isMounted) setLoadingYears(false);
			}
		})();
		return () => { isMounted = false; };
	}, [formData.model_id]);

	const handleInputChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
			...(field === 'make_id' ? { model_id: '', year: '' } : {}),
			...(field === 'model_id' ? { year: '' } : {})
		}));
		// no-op
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: null }));
		}
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.make_id) newErrors.make_id = 'Выберите марку';
		if (!formData.model_id) newErrors.model_id = 'Выберите модель';
		if (!formData.year) newErrors.year = 'Выберите год';
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (validateForm()) {
			const submitData = {
				make_id: parseInt(formData.make_id),
				model_id: parseInt(formData.model_id),
				year: parseInt(formData.year),
				vin: formData.vin || undefined,
				comment: formData.comment || undefined
			};
			onSubmit(submitData);
		}
	};

	return (
		<div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h4 className="font-semibold text-slate-900">Добавить автомобиль</h4>
					<p className="text-sm text-slate-600">Заполните информацию о вашем автомобиле</p>
				</div>
				<button
					onClick={onCancel}
					className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Make and Model Row */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Марка *
						</label>
						<select
							value={formData.make_id}
							onChange={(e) => handleInputChange('make_id', e.target.value)}
							className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
								errors.make_id ? 'border-red-300' : 'border-slate-300'
							}`}
						>
							<option value="">{loadingMakes ? 'Загрузка...' : 'Выберите марку'}</option>
							{makes.map(mk => (
								<option key={mk.make_id} value={mk.make_id}>{mk.make_name}</option>
							))}
						</select>
						{errors.make_id && <p className="text-red-500 text-xs mt-1">{errors.make_id}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Модель *
						</label>
						<select
							value={formData.model_id}
							onChange={(e) => handleInputChange('model_id', e.target.value)}
							disabled={!formData.make_id}
							className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
								errors.model_id ? 'border-red-300' : 'border-slate-300'
							} ${!formData.make_id ? 'bg-slate-100' : ''}`}
						>
							<option value="">{loadingModels ? 'Загрузка...' : (!formData.make_id ? 'Сначала выберите марку' : 'Выберите модель')}</option>
							{models.map(model => (
								<option key={model.model_id} value={model.model_id}>
									{model.model_name}
								</option>
							))}
						</select>
						{errors.model_id && <p className="text-red-500 text-xs mt-1">{errors.model_id}</p>}
					</div>
				</div>

				{/* Year */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Год выпуска *
						</label>
						<select
							value={formData.year}
							onChange={(e) => handleInputChange('year', e.target.value)}
							className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
								errors.year ? 'border-red-300' : 'border-slate-300'
							}`}
							disabled={!formData.model_id}
						>
							<option value="">{loadingYears ? 'Загрузка...' : (!formData.model_id ? 'Сначала выберите модель' : 'Выберите год')}</option>
							{years.map(year => (
								<option key={year} value={year}>{year}</option>
							))}
						</select>
						{errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
					</div>
				</div>

				{/* VIN */}
				<div>
					<label className="block text-sm font-medium text-slate-700 mb-2">
						VIN-номер (опционально)
					</label>
					<input
						type="text"
						value={formData.vin}
						onChange={(e) => handleInputChange('vin', e.target.value)}
						placeholder="Введите VIN-номер"
						className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
					/>
				</div>

				{/* Comment */}
				<div>
					<label className="block text-sm font-medium text-slate-700 mb-2">
						Комментарий (опционально)
					</label>
					<textarea
						value={formData.comment}
						onChange={(e) => handleInputChange('comment', e.target.value)}
						placeholder="Дополнительная информация об автомобиле"
						rows={2}
						className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
					/>
				</div>

				{/* Actions */}
				<div className="flex gap-3 pt-4">
					<button
						type="submit"
						disabled={loading}
						className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
					>
						{loading && (
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						)}
						{loading ? 'Добавляем...' : 'Добавить автомобиль'}
					</button>
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
					>
						Отмена
					</button>
				</div>
			</form>
		</div>
	);
}
