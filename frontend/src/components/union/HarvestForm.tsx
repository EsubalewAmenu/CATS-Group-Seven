import React, { useState } from 'react';
import { HarvestData } from '../../types/supplychain';
import { useBatches } from '../../hooks/useBatches';
import { COFFEE_VARIETIES, PROCESS_METHODS } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface HarvestFormProps {
  onSuccess: () => void;
}

export default function HarvestForm({ onSuccess }: HarvestFormProps) {
  const { addBatch } = useBatches();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<HarvestData>({
    cropType: 'coffee', // Default crop type is always coffee
    weight: 0,
    variety: COFFEE_VARIETIES[0],
    harvestDate: new Date().toISOString().split('T')[0],
    process: PROCESS_METHODS[0],
    elevation: '',
    gps: '',
    farmerName: '',
    farmerPhotoUrl: ''
  });

  const handleSubmit = async () => {
    if (!formData.farmerName.trim()) {
      alert('Please enter the farmer\'s name');
      return;
    }

    setIsSubmitting(true);
    try {
      await addBatch(formData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create batch:', error);
      alert('Failed to register harvest: ' + (error as any).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof HarvestData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // Step 1: Farmer Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-stone-800">Farmer Information</h3>
      <p className="text-sm text-stone-500">Enter the details of the farmer who produced this harvest</p>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Farmer Name *</label>
        <input
          type="text"
          value={formData.farmerName}
          onChange={(e) => handleChange('farmerName', e.target.value)}
          className="w-full p-4 border border-stone-200 rounded-xl text-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
          placeholder="e.g. Abebe Bekele"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Farmer Photo URL (Optional)</label>
        <input
          type="url"
          value={formData.farmerPhotoUrl || ''}
          onChange={(e) => handleChange('farmerPhotoUrl', e.target.value)}
          className="w-full p-4 border border-stone-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
          placeholder="https://example.com/photo.jpg"
        />
        {formData.farmerPhotoUrl && (
          <div className="mt-3 flex justify-center">
            <img
              src={formData.farmerPhotoUrl}
              alt="Farmer preview"
              className="w-24 h-24 rounded-full object-cover border-2 border-stone-200"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}
      </div>

      <Button
        onClick={nextStep}
        className="w-full h-12 text-lg"
        disabled={!formData.farmerName.trim()}
      >
        Next: Harvest Details
      </Button>
    </div>
  );

  // Step 2: Harvest Details
  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-stone-800">Harvest Details</h3>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Weight (kg)</label>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleChange('weight', Math.max(0, formData.weight - 10))}
          >
            -
          </Button>
          <input
            type="number"
            value={formData.weight || ''}
            onChange={(e) => handleChange('weight', parseInt(e.target.value) || 0)}
            className="flex-1 text-center text-2xl font-bold p-2 border-b-2 border-stone-200 focus:border-emerald-500 outline-none"
            placeholder="0"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleChange('weight', formData.weight + 10)}
          >
            +
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Variety</label>
        <select
          value={formData.variety}
          onChange={(e) => handleChange('variety', e.target.value)}
          className="w-full p-4 bg-white border border-stone-200 rounded-xl text-lg"
        >
          {COFFEE_VARIETIES.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={prevStep} className="flex-1 h-12">Back</Button>
        <Button onClick={nextStep} className="flex-[2] h-12">Next: Location</Button>
      </div>
    </div>
  );

  // Step 3: Location (GPS only, no region field)
  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-stone-800">Location Data</h3>

      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
        <label className="block text-sm font-medium text-stone-700 mb-2">GPS Coordinates</label>
        <div className="flex space-x-2">
          <input
            readOnly
            value={formData.gps || "Waiting for signal..."}
            className="flex-1 bg-transparent font-mono text-sm"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleChange('gps', '5.8500° N, 39.0500° E')}
          >
            📍 Get GPS
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Elevation (optional)</label>
        <input
          type="text"
          value={formData.elevation}
          onChange={(e) => handleChange('elevation', e.target.value)}
          className="w-full p-4 border border-stone-200 rounded-xl"
          placeholder="e.g. 1,800m"
        />
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={prevStep} className="flex-1 h-12">Back</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-[2] h-12">
          {isSubmitting ? <LoadingSpinner size="sm" /> : 'Register Harvest'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto pb-20">
      <Card className="border-0 shadow-none md:border md:shadow-sm">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-2 w-16 rounded-full transition-colors",
                  step >= i ? "bg-emerald-500" : "bg-stone-200"
                )}
              />
            ))}
          </div>
          <CardTitle>New Coffee Harvest</CardTitle>
          {formData.farmerName && (
            <p className="text-sm text-stone-500 mt-1">Farmer: {formData.farmerName}</p>
          )}
        </CardHeader>

        <CardContent>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </CardContent>
      </Card>
    </div>
  );
}
