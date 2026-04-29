import { useState } from 'react';
import { useStore } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Badge } from '@/components/core/badge';
import { Label } from '@/components/core/label';
import { User, Mail, Briefcase, MapPin, Calendar, Upload, Edit, Save, X } from 'lucide-react';
import { format } from 'date-fns';

export function EmployeeProfile() {
  const { auth, resources, updateResource } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    skills: '',
    experience: 0,
    location: '',
    domain: '',
  });

  if (!auth.user) return null;

  // Get my profile from bench resources
  const myProfile = resources.find(r => r.email === auth.user!.email);

  if (!myProfile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleEdit = () => {
    setFormData({
      name: myProfile.name,
      designation: myProfile.designation,
      skills: myProfile.skills.map(s => s.name).join(', '),
      experience: myProfile.experience,
      location: myProfile.location,
      domain: myProfile.domain || '',
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateResource(myProfile.id, {
      name: formData.name,
      designation: formData.designation,
      skills: formData.skills.split(',').map(s => ({
        name: s.trim(),
        level: 'INTERMEDIATE' as const,
      })).filter(s => s.name),
      experience: formData.experience,
      location: formData.location,
      domain: formData.domain || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your profile information
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-lg border p-6">
          {!isEditing ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Name
                  </div>
                  <div className="text-lg font-semibold">{myProfile.name}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <div className="text-lg">{myProfile.email}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    Designation
                  </div>
                  <div className="text-lg font-semibold">{myProfile.designation}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Experience
                  </div>
                  <div className="text-lg">{myProfile.experience} years</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Location
                  </div>
                  <div className="text-lg">{myProfile.location}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge variant={myProfile.status === 'AVAILABLE' ? 'success' : 'info'}>
                    {myProfile.status}
                  </Badge>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <div className="text-sm font-medium">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {myProfile.skills.map(skill => (
                    <Badge key={skill.name} variant="secondary">
                      {skill.name} - {skill.level}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Domain */}
              {myProfile.domain && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Domain</div>
                  <div>{myProfile.domain}</div>
                </div>
              )}

              {/* Resume */}
              <div className="space-y-3">
                <div className="text-sm font-medium">Resume</div>
                {myProfile.resume ? (
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-green-600">Resume uploaded</div>
                    <Button size="sm" variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Update Resume
                    </Button>
                  </div>
                ) : (
                  <Button size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Resume
                  </Button>
                )}
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t text-sm text-muted-foreground">
                <div>Available from: {format(new Date(myProfile.availability), 'MMM dd, yyyy')}</div>
                <div className="mt-1">Member since: {format(new Date(myProfile.createdAt), 'MMM dd, yyyy')}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Edit Form */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Cannot be changed)</Label>
                  <Input
                    id="email"
                    value={myProfile.email}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Designation *</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (years) *</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="skills">Skills (comma-separated) *</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain (optional)</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Login Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <h3 className="font-semibold mb-2">Login Credentials</h3>
          <div className="text-sm space-y-1">
            <div>Username: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">{myProfile.email}</code></div>
            <div>Password: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">password</code> (default)</div>
            <p className="text-xs text-muted-foreground mt-2">Contact HR to change your password</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
