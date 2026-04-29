import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';
import { Badge } from '@/components/core/badge';
import { Settings, Plus, Trash2, GripVertical } from 'lucide-react';

export function SettingsPage() {
  const [interviewStages, setInterviewStages] = useState([
    'AI Screening',
    'Technical L1',
    'Technical L2',
    'Manager Round',
    'HR Round',
  ]);
  const [holdReasons, setHoldReasons] = useState([
    'Budget approval pending',
    'Hiring freeze',
    'Candidate comparison',
    'Awaiting stakeholder input',
  ]);
  const [newStage, setNewStage] = useState('');
  const [newReason, setNewReason] = useState('');
  const [slaConfig, setSlaConfig] = useState({
    holdReviewDays: 7,
    requirementAgingDays: 30,
    autoShortlistThreshold: 70,
  });
  const [appSettings, setAppSettings] = useState({
    allowSelfApply: true,
    requireApplicationNote: false,
    autoCloseOnFilled: true,
  });

  const addInterviewStage = () => {
    if (newStage.trim()) {
      setInterviewStages([...interviewStages, newStage.trim()]);
      setNewStage('');
    }
  };

  const removeInterviewStage = (index: number) => {
    setInterviewStages(interviewStages.filter((_, i) => i !== index));
  };

  const addHoldReason = () => {
    if (newReason.trim()) {
      setHoldReasons([...holdReasons, newReason.trim()]);
      setNewReason('');
    }
  };

  const removeHoldReason = (index: number) => {
    setHoldReasons(holdReasons.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // In production, this would call API to save settings
    alert('Settings saved successfully!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8" />
              System Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure interview pipeline, hold reasons, and application settings
            </p>
          </div>
          <Button onClick={handleSave}>
            Save All Changes
          </Button>
        </div>

        {/* Interview Pipeline Templates */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Interview Pipeline Templates</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Define default interview stages for all requirements
          </p>
          
          <div className="space-y-3">
            {interviewStages.map((stage, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                <Badge variant="secondary" className="px-3 py-1">
                  {index + 1}
                </Badge>
                <div className="flex-1 font-medium">{stage}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInterviewStage(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Enter new stage name (e.g., Design Round)"
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addInterviewStage()}
            />
            <Button onClick={addInterviewStage}>
              <Plus className="h-4 w-4 mr-2" />
              Add Stage
            </Button>
          </div>
        </div>

        {/* Hold Reasons */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Hold Reasons</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Predefined reasons for putting requirements or applications on hold
          </p>
          
          <div className="space-y-2">
            {holdReasons.map((reason, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>{reason}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHoldReason(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Enter new hold reason"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addHoldReason()}
            />
            <Button onClick={addHoldReason}>
              <Plus className="h-4 w-4 mr-2" />
              Add Reason
            </Button>
          </div>
        </div>

        {/* SLA Configuration */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">SLA Configuration</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="holdReviewDays">Hold Review Period (days)</Label>
              <Input
                id="holdReviewDays"
                type="number"
                min="1"
                value={slaConfig.holdReviewDays}
                onChange={(e) => setSlaConfig({ ...slaConfig, holdReviewDays: parseInt(e.target.value) || 7 })}
              />
              <p className="text-xs text-muted-foreground">
                Number of days before hold items require review
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirementAgingDays">Requirement Aging Alert (days)</Label>
              <Input
                id="requirementAgingDays"
                type="number"
                min="1"
                value={slaConfig.requirementAgingDays}
                onChange={(e) => setSlaConfig({ ...slaConfig, requirementAgingDays: parseInt(e.target.value) || 30 })}
              />
              <p className="text-xs text-muted-foreground">
                Alert when requirement is open for this many days
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="autoShortlistThreshold">Auto-Shortlist AI Score Threshold (%)</Label>
              <Input
                id="autoShortlistThreshold"
                type="number"
                min="0"
                max="100"
                value={slaConfig.autoShortlistThreshold}
                onChange={(e) => setSlaConfig({ ...slaConfig, autoShortlistThreshold: parseInt(e.target.value) || 70 })}
              />
              <p className="text-xs text-muted-foreground">
                Automatically shortlist candidates with AI score above this threshold
              </p>
            </div>
          </div>
        </div>

        {/* Application Settings */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Application Settings</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Allow Self-Apply</div>
                <div className="text-sm text-muted-foreground">
                  Let employees browse and apply to open requirements
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings.allowSelfApply}
                  onChange={(e) => setAppSettings({ ...appSettings, allowSelfApply: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Require Application Note</div>
                <div className="text-sm text-muted-foreground">
                  Make application note mandatory for self-apply
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings.requireApplicationNote}
                  onChange={(e) => setAppSettings({ ...appSettings, requireApplicationNote: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-Close on Filled</div>
                <div className="text-sm text-muted-foreground">
                  Automatically close requirement when all positions are filled
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings.autoCloseOnFilled}
                  onChange={(e) => setAppSettings({ ...appSettings, autoCloseOnFilled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Current Configuration Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <h3 className="font-semibold mb-3">Configuration Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Interview Stages</div>
              <div className="font-medium">{interviewStages.length} stages configured</div>
            </div>
            <div>
              <div className="text-muted-foreground">Hold Reasons</div>
              <div className="font-medium">{holdReasons.length} reasons configured</div>
            </div>
            <div>
              <div className="text-muted-foreground">Hold Review SLA</div>
              <div className="font-medium">{slaConfig.holdReviewDays} days</div>
            </div>
            <div>
              <div className="text-muted-foreground">AI Auto-Shortlist</div>
              <div className="font-medium">{slaConfig.autoShortlistThreshold}% threshold</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
