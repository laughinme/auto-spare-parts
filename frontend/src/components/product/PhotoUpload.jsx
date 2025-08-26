import React, { useState, useRef } from 'react';

export default function PhotoUpload({ photos = [], onPhotosChange, maxFiles = 10, disabled = false }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file validation
  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes

    if (!validTypes.includes(file.type)) {
      return 'Поддерживаются только JPEG и PNG файлы';
    }

    if (file.size > maxSize) {
      return 'Размер файла не должен превышать 10 МБ';
    }

    return null;
  };

  // Handle file selection
  const handleFiles = (files) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const errors = [];
    const validFiles = [];

    // Check if adding these files would exceed max limit
    if (photos.length + fileArray.length > maxFiles) {
      alert(`Можно загрузить максимум ${maxFiles} фотографий. У вас уже ${photos.length} фото.`);
      return;
    }

    fileArray.forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`Файл ${index + 1}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert('Ошибки при загрузке файлов:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      // Create preview objects for new files
      const newPhotos = validFiles.map(file => ({
        id: Date.now() + Math.random(), // Temporary ID for new files
        file: file,
        preview: URL.createObjectURL(file),
        isNew: true
      }));

      onPhotosChange([...photos, ...newPhotos]);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Remove photo
  const removePhoto = (photoToRemove) => {
    if (disabled) return;
    
    // Clean up preview URL to prevent memory leaks
    if (photoToRemove.preview && photoToRemove.isNew) {
      URL.revokeObjectURL(photoToRemove.preview);
    }
    
    const updatedPhotos = photos.filter(photo => photo.id !== photoToRemove.id);
    onPhotosChange(updatedPhotos);
  };

  // Open file dialog
  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
          disabled 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 cursor-pointer'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="text-center">
          <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
            disabled ? 'bg-gray-200' : 'bg-blue-100'
          }`}>
            <svg className={`w-6 h-6 ${disabled ? 'text-gray-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div className={`space-y-2 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            <p className="text-lg font-medium">
              {disabled ? 'Загрузка фото недоступна' : 'Перетащите фото сюда или нажмите для выбора'}
            </p>
            <p className="text-sm text-gray-500">
              JPEG, PNG до 10 МБ (максимум {maxFiles} фото)
            </p>
            {photos.length > 0 && (
              <p className="text-sm text-blue-600 font-medium">
                Загружено: {photos.length} из {maxFiles}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Photo Previews */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Фотографии товара ({photos.length})
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={photo.preview || photo.url}
                    alt={photo.alt || 'Фото товара'}
                    className="w-full h-full object-cover"
                    onLoad={() => {
                      // Clean up blob URL after image loads
                      if (photo.isNew && photo.preview) {
                        // Don't revoke immediately, let it stay for the duration
                      }
                    }}
                  />
                </div>
                
                {/* Remove button */}
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(photo);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* New file indicator */}
                {photo.isNew && (
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                      Новое
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
