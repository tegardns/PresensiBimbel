import { useState } from 'react';
import { Upload, Building2, Phone, MapPin } from 'lucide-react';

interface ProfilInstansiProps {
  namaBimbel: string;
  setNamaBimbel: (val: string) => void;
  whatsapp: string;
  setWhatsapp: (val: string) => void;
  alamat: string;
  setAlamat: (val: string) => void;
  logoPreview: string | null;
  setLogoPreview: (val: string | null) => void;
  onChangeDetected: () => void;
}

export function ProfilInstansi({
  namaBimbel,
  setNamaBimbel,
  whatsapp,
  setWhatsapp,
  alamat,
  setAlamat,
  logoPreview,
  setLogoPreview,
  onChangeDetected,
}: ProfilInstansiProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setLogoPreview(event.target?.result as string);
          onChangeDetected();
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
        onChangeDetected();
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Identitas Visual</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Bimbel
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {logoPreview ? (
                <div className="flex flex-col items-center gap-4">
                  <img src={logoPreview} alt="Logo Preview" className="h-32 object-contain" />
                  <p className="text-sm text-gray-600">Logo akan ter-update di seluruh aplikasi</p>
                  <label className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                    Ganti Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-700 mb-1">
                      Drag & drop logo di sini, atau{' '}
                      <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                        pilih file
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, SVG (max 2MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Bimbel
            </label>
            <input
              type="text"
              value={namaBimbel}
              onChange={(e) => {
                setNamaBimbel(e.target.value);
                onChangeDetected();
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan nama bimbel"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nama ini akan muncul di header aplikasi dan dokumen resmi
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Phone className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold">Kontak Admin</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor WhatsApp Support
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => {
                setWhatsapp(e.target.value);
                onChangeDetected();
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+62 812-xxxx-xxxx"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nomor ini akan ditampilkan di aplikasi tutor untuk bantuan teknis
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Alamat Kantor
            </label>
            <textarea
              value={alamat}
              onChange={(e) => {
                setAlamat(e.target.value);
                onChangeDetected();
              }}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Masukkan alamat lengkap kantor"
            />
            <p className="text-xs text-gray-500 mt-1">
              Alamat ini akan tertera di slip gaji dan laporan resmi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
