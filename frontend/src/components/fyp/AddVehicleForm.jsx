import React, { useState } from "react";

// AddVehicleForm component for adding vehicles to garage
export default function AddVehicleForm({ onSubmit, onCancel, loading }) {
	const [formData, setFormData] = useState({
		make_id: '',
		model_id: '',
		year: new Date().getFullYear(),
		vehicle_type_id: '',
		vin: '',
		comment: ''
	});
	const [errors, setErrors] = useState({});

	// Mock data for demo - in real app, these would come from API
	const mockMakes = [
		{ make_id: 1, make_name: 'Toyota' },
		{ make_id: 2, make_name: 'Honda' },
		{ make_id: 3, make_name: 'BMW' },
		{ make_id: 4, make_name: 'Mercedes-Benz' },
		{ make_id: 5, make_name: 'Audi' },
		{ make_id: 6, make_name: 'Volkswagen' },
		{ make_id: 7, make_name: 'Ford' },
		{ make_id: 8, make_name: 'Chevrolet' },
		{ make_id: 9, make_name: 'Nissan' },
		{ make_id: 10, make_name: 'Hyundai' }
	];

	const mockModels = {
		1: [{ model_id: 1, model_name: 'Camry' }, { model_id: 2, model_name: 'Corolla' }, { model_id: 3, model_name: 'RAV4' }],
		2: [{ model_id: 4, model_name: 'Civic' }, { model_id: 5, model_name: 'Accord' }, { model_id: 6, model_name: 'CR-V' }],
		3: [{ model_id: 7, model_name: '3 Series' }, { model_id: 8, model_name: '5 Series' }, { model_id: 9, model_name: 'X3' }],
		4: [{ model_id: 10, model_name: 'C-Class' }, { model_id: 11, model_name: 'E-Class' }, { model_id: 12, model_name: 'GLC' }],
		5: [{ model_id: 13, model_name: 'A4' }, { model_id: 14, model_name: 'A6' }, { model_id: 15, model_name: 'Q5' }],
		6: [{ model_id: 16, model_name: 'Golf' }, { model_id: 17, model_name: 'Passat' }, { model_id: 18, model_name: 'Tiguan' }],
		7: [{ model_id: 19, model_name: 'Focus' }, { model_id: 20, model_name: 'Mustang' }, { model_id: 21, model_name: 'Explorer' }],
		8: [{ model_id: 22, model_name: 'Malibu' }, { model_id: 23, model_name: 'Equinox' }, { model_id: 24, model_name: 'Silverado' }],
		9: [{ model_id: 25, model_name: 'Altima' }, { model_id: 26, model_name: 'Sentra' }, { model_id: 27, model_name: 'Rogue' }],
		10: [{ model_id: 28, model_name: 'Elantra' }, { model_id: 29, model_name: 'Sonata' }, { model_id: 30, model_name: 'Tucson' }]
	};

	const mockVehicleTypes = [
		{ vehicle_type_id: 1, name: 'Седан' },
		{ vehicle_type_id: 2, name: 'Хэтчбек' },
		{ vehicle_type_id: 3, name: 'Универсал' },
		{ vehicle_type_id: 4, name: 'Кроссовер' },
		{ vehicle_type_id: 5, name: 'Внедорожник' },
		{ vehicle_type_id: 6, name: 'Кабриолет' },
		{ vehicle_type_id: 7, name: 'Купе' },
		{ vehicle_type_id: 8, name: 'Пикап' }
	];

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

	const availableModels = formData.make_id ? mockModels[formData.make_id] || [] : [];

	const handleInputChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
			// Reset model when make changes
			...(field === 'make_id' ? { model_id: '' } : {})
		}));
		// Clear error when user starts typing
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
				...formData,
				make_id: parseInt(formData.make_id),
				model_id: parseInt(formData.model_id),
				year: parseInt(formData.year),
				vehicle_type_id: formData.vehicle_type_id ? parseInt(formData.vehicle_type_id) : null
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
							<option value="">Выберите марку</option>
							{mockMakes.map(make => (
								<option key={make.make_id} value={make.make_id}>
									{make.make_name}
								</option>
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
							<option value="">Выберите модель</option>
							{availableModels.map(model => (
								<option key={model.model_id} value={model.model_id}>
									{model.model_name}
								</option>
							))}
						</select>
						{errors.model_id && <p className="text-red-500 text-xs mt-1">{errors.model_id}</p>}
					</div>
				</div>

				{/* Year and Vehicle Type Row */}
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
						>
							{years.map(year => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
						{errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Тип кузова
						</label>
						<select
							value={formData.vehicle_type_id}
							onChange={(e) => handleInputChange('vehicle_type_id', e.target.value)}
							className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
						>
							<option value="">Выберите тип</option>
							{mockVehicleTypes.map(type => (
								<option key={type.vehicle_type_id} value={type.vehicle_type_id}>
									{type.name}
								</option>
							))}
						</select>
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
