import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// PyMuPDF encryption constants
const ENCRYPTION_CONSTANTS = {
  'PDF_ENCRYPT_NONE': 1,
  'PDF_ENCRYPT_RC4_40': 2,
  'PDF_ENCRYPT_RC4_128': 3,
  'PDF_ENCRYPT_AES_128': 4,
  'PDF_ENCRYPT_AES_256': 5,
};

// PyMuPDF permission constants
const PERMISSION_CONSTANTS: Record<string, number> = {
  'PDF_PERM_PRINT': 4,
  'PDF_PERM_MODIFY': 8,
  'PDF_PERM_COPY': 16,
  'PDF_PERM_ANNOTATE': 32,
  'PDF_PERM_FORM': 256,
  'PDF_PERM_ACCESSIBILITY': 512,
  'PDF_PERM_ASSEMBLE': 1024,
  'PDF_PERM_PRINT_HQ': 2048,
};

interface SaveOptionsPanelProps {
  onConfirm: (options: Record<string, any>) => void;
  onCancel?: () => void;
  initialOptions?: Record<string, any>;
}

/**
 * Simple save options panel for configuring PDF output
 */
export function SaveOptionsPanel({
  onConfirm,
  onCancel,
  initialOptions = {},
}: SaveOptionsPanelProps) {
  const [options, setOptions] = useState(initialOptions);

  const handleToggle = (key: string) => {
    setOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNumberInput = (key: string, value: number) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePermissionToggle = (permissionKey: string) => {
    const permissionValue = PERMISSION_CONSTANTS[permissionKey];
    const currentPermissions = options.permissions || 0;
    
    // Check if this permission is already set
    const isSet = (currentPermissions & permissionValue) === permissionValue;
    
    if (isSet) {
      // Remove this permission
      const newPermissions = currentPermissions & ~permissionValue;
      if (newPermissions === 0) {
        setOptions(prev => {
          const newOptions = { ...prev };
          delete newOptions.permissions;
          return newOptions;
        });
      } else {
        setOptions(prev => ({ ...prev, permissions: newPermissions }));
      }
    } else {
      // Add this permission
      setOptions(prev => ({ ...prev, permissions: currentPermissions | permissionValue }));
    }
  };

  const isPermissionSet = (permissionKey: string): boolean => {
    const permissionValue = PERMISSION_CONSTANTS[permissionKey];
    const currentPermissions = options.permissions || 0;
    return (currentPermissions & permissionValue) === permissionValue;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20">
      <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Save Options</CardTitle>
        <CardDescription>
            Configure PDF output settings.
            <br />
            <span className="text-xs text-muted-foreground mt-1 block">
                Advised: garbage=3|4, deflate=True, use_objstms=True
            </span>
        </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Garbage Collection */}
          <div>
            <Label htmlFor="garbage">Garbage Collection</Label>
            <p className="text-xs  mb-2">Remove unused objects and optimize file structure</p>
            <Select 
              value={options.garbage !== undefined ? String(options.garbage) : ''} 
              onValueChange={(value) => {
                if (value === '') {
                  setOptions(prev => {
                    const newOptions = { ...prev };
                    delete newOptions.garbage;
                    return newOptions;
                  });
                } else {
                  handleNumberInput('garbage', parseInt(value));
                }
              }}
            >
              <SelectTrigger id="garbage">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 - None (no garbage collection)</SelectItem>
                <SelectItem value="1">1 - Remove unused objects</SelectItem>
                <SelectItem value="2">2 - Compact xref table</SelectItem>
                <SelectItem value="3">3 - Merge duplicate objects</SelectItem>
                <SelectItem value="4">4 - Check streams for duplication (slow)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expand Option */}
          <div>
            <Label htmlFor="expand">Expand</Label>
            <p className="text-xs  mb-2">Decompress objects for better readability (generates larger files)</p>
            <Select 
              value={options.expand !== undefined ? String(options.expand) : ''} 
              onValueChange={(value) => {
                if (value === '') {
                  setOptions(prev => {
                    const newOptions = { ...prev };
                    delete newOptions.expand;
                    return newOptions;
                  });
                } else {
                  handleNumberInput('expand', parseInt(value));
                }
              }}
            >
              <SelectTrigger id="expand">
                <SelectValue placeholder="Default (0)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 - None</SelectItem>
                <SelectItem value="1">1 - Images only</SelectItem>
                <SelectItem value="2">2 - Fonts only</SelectItem>
                <SelectItem value="255">255 - All (images and fonts)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Encryption Option */}
          <div>
            <Label htmlFor="encryption">Encryption</Label>
            <p className="text-xs  mb-2">Set encryption method for the document</p>
            <Select 
              value={options.encryption !== undefined ? String(options.encryption) : ''} 
              onValueChange={(value) => {
                if (value === '') {
                  setOptions(prev => {
                    const newOptions = { ...prev };
                    delete newOptions.encryption;
                    return newOptions;
                  });
                } else {
                  handleNumberInput('encryption', parseInt(value));
                }
              }}
            >
              <SelectTrigger id="encryption">
                <SelectValue placeholder="Default (None)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(ENCRYPTION_CONSTANTS['PDF_ENCRYPT_NONE'])}>None</SelectItem>
                <SelectItem value={String(ENCRYPTION_CONSTANTS['PDF_ENCRYPT_RC4_40'])}>RC4 40-bit</SelectItem>
                <SelectItem value={String(ENCRYPTION_CONSTANTS['PDF_ENCRYPT_RC4_128'])}>RC4 128-bit</SelectItem>
                <SelectItem value={String(ENCRYPTION_CONSTANTS['PDF_ENCRYPT_AES_128'])}>AES 128-bit</SelectItem>
                <SelectItem value={String(ENCRYPTION_CONSTANTS['PDF_ENCRYPT_AES_256'])}>AES 256-bit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Permissions Option */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Permissions</Label>
            <p className="text-xs  mb-3">Set desired permission levels for document access.</p>
            <div className="space-y-2 border rounded-md p-3">
              <div className="flex items-center space-x-2 mb-3 pb-3 border-b">
                <Checkbox
                  id="use_default_perms"
                  checked={options.permissions === undefined}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setOptions(prev => {
                        const newOptions = { ...prev };
                        delete newOptions.permissions;
                        return newOptions;
                      });
                    } else {
                      // Set to all permissions enabled when unchecking
                      const allPermissions = Object.values(PERMISSION_CONSTANTS).reduce((acc, val) => acc | val, 0);
                      setOptions(prev => ({ ...prev, permissions: allPermissions }));
                    }
                  }}
                />
                <Label htmlFor="use_default_perms" className="cursor-pointer font-medium">
                  Don't change permissions (use document defaults)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm_print"
                  checked={isPermissionSet('PDF_PERM_PRINT')}
                  onCheckedChange={() => handlePermissionToggle('PDF_PERM_PRINT')}
                  disabled={options.permissions === undefined}
                />
                <Label htmlFor="perm_print" className="cursor-pointer">
                  Print
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm_modify"
                  checked={isPermissionSet('PDF_PERM_MODIFY')}
                  onCheckedChange={() => handlePermissionToggle('PDF_PERM_MODIFY')}
                  disabled={options.permissions === undefined}
                />
                <Label htmlFor="perm_modify" className="cursor-pointer">
                  Modify
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm_copy"
                  checked={isPermissionSet('PDF_PERM_COPY')}
                  onCheckedChange={() => handlePermissionToggle('PDF_PERM_COPY')}
                  disabled={options.permissions === undefined}
                />
                <Label htmlFor="perm_copy" className="cursor-pointer">
                  Copy / Extract
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm_annotate"
                  checked={isPermissionSet('PDF_PERM_ANNOTATE')}
                  onCheckedChange={() => handlePermissionToggle('PDF_PERM_ANNOTATE')}
                  disabled={options.permissions === undefined}
                />
                <Label htmlFor="perm_annotate" className="cursor-pointer">
                  Annotate
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm_form"
                  checked={isPermissionSet('PDF_PERM_FORM')}
                  onCheckedChange={() => handlePermissionToggle('PDF_PERM_FORM')}
                  disabled={options.permissions === undefined}
                />
                <Label htmlFor="perm_form" className="cursor-pointer">
                  Fill Forms
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm_assemble"
                  checked={isPermissionSet('PDF_PERM_ASSEMBLE')}
                  onCheckedChange={() => handlePermissionToggle('PDF_PERM_ASSEMBLE')}
                  disabled={options.permissions === undefined}
                />
                <Label htmlFor="perm_assemble" className="cursor-pointer">
                  Assemble (Pages/Bookmarks)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm_print_hq"
                  checked={isPermissionSet('PDF_PERM_PRINT_HQ')}
                  onCheckedChange={() => handlePermissionToggle('PDF_PERM_PRINT_HQ')}
                  disabled={options.permissions === undefined}
                />
                <Label htmlFor="perm_print_hq" className="cursor-pointer">
                  High Quality Print
                </Label>
              </div>
            </div>
          </div>

          {/* Owner Password */}
          <div>
            <Label htmlFor="owner_pw">Owner Password</Label>
            <p className="text-xs  mb-2">Max 40 characters. If not provided, user password is used instead</p>
            <input
              type="password"
              id="owner_pw"
              value={options.owner_pw ?? ''}
              onChange={(e) => {
                if (e.target.value === '') {
                  setOptions(prev => {
                    const newOptions = { ...prev };
                    delete newOptions.owner_pw;
                    return newOptions;
                  });
                } else {
                  setOptions(prev => ({ ...prev, owner_pw: e.target.value }));
                }
              }}
              maxLength={40}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Leave empty for none"
            />
          </div>

          {/* User Password */}
          <div>
            <Label htmlFor="user_pw">User Password</Label>
            <p className="text-xs  mb-2">Max 40 characters. Restricts what users can do with the document</p>
            <input
              type="password"
              id="user_pw"
              value={options.user_pw ?? ''}
              onChange={(e) => {
                if (e.target.value === '') {
                  setOptions(prev => {
                    const newOptions = { ...prev };
                    delete newOptions.user_pw;
                    return newOptions;
                  });
                } else {
                  setOptions(prev => ({ ...prev, user_pw: e.target.value }));
                }
              }}
              maxLength={40}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Leave empty for none"
            />
          </div>

          {/* Boolean Flags */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="clean"
                checked={options.clean ?? false}
                onCheckedChange={() => handleToggle('clean')}
              />
              <div className="flex-1">
                <Label htmlFor="clean" className="cursor-pointer text-sm font-medium block">
                  Clean Structure
                </Label>
                <p className="text-xs">Clean and sanitize content streams. Corresponds to "mutool clean -sc"</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="deflate"
                checked={options.deflate ?? false}
                onCheckedChange={() => handleToggle('deflate')}
              />
              <div className="flex-1">
                <Label htmlFor="deflate" className="cursor-pointer text-sm font-medium block">
                  Deflate
                </Label>
                <p className="text-xs">Compress uncompressed streams</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="deflate_images"
                checked={options.deflate_images ?? false}
                onCheckedChange={() => handleToggle('deflate_images')}
              />
              <div className="flex-1">
                <Label htmlFor="deflate_images" className="cursor-pointer text-sm font-medium block">
                  Deflate Images
                </Label>
                <p className="text-xs">Compress uncompressed image streams</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="deflate_fonts"
                checked={options.deflate_fonts ?? false}
                onCheckedChange={() => handleToggle('deflate_fonts')}
              />
              <div className="flex-1">
                <Label htmlFor="deflate_fonts" className="cursor-pointer text-sm font-medium block">
                  Deflate Fonts
                </Label>
                <p className="text-xs">Compress uncompressed fontfile streams</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ascii"
                checked={options.ascii ?? false}
                onCheckedChange={() => handleToggle('ascii')}
              />
              <div className="flex-1">
                <Label htmlFor="ascii" className="cursor-pointer text-sm font-medium block">
                  ASCII Output
                </Label>
                <p className="text-xs">Convert binary data to ASCII</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="linear"
                checked={options.linear ?? false}
                onCheckedChange={() => handleToggle('linear')}
              />
              <div className="flex-1">
                <Label htmlFor="linear" className="cursor-pointer text-sm font-medium block">
                  Linear PDF
                </Label>
                <p className="text-xs">Linearize for web/internet access. Excludes "incremental" and "use_objstms"</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="pretty"
                checked={options.pretty ?? false}
                onCheckedChange={() => handleToggle('pretty')}
              />
              <div className="flex-1">
                <Label htmlFor="pretty" className="cursor-pointer text-sm font-medium block">
                  Pretty Print
                </Label>
                <p className="text-xs">Prettify source for better readability</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="no_new_id"
                checked={options.no_new_id ?? false}
                onCheckedChange={() => handleToggle('no_new_id')}
              />
              <div className="flex-1">
                <Label htmlFor="no_new_id" className="cursor-pointer text-sm font-medium block">
                  No New ID
                </Label>
                <p className="text-xs">Suppress /ID field update. Prevents new identification on save</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="use_objstms"
                checked={options.use_objstms === 1}
                onCheckedChange={(checked) => handleNumberInput('use_objstms', checked ? 1 : 0)}
              />
              <div className="flex-1">
                <Label htmlFor="use_objstms" className="cursor-pointer text-sm font-medium block">
                  Use Object Streams
                </Label>
                <p className="text-xs">Compress objects in streams for significant file size reduction</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => onConfirm(options)}>
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SaveOptionsPanel;
