'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Edit, Plus } from 'lucide-react';

interface ShippingZone {
  id: string;
  name: string;
  nameAr: string;
  cities: string[];
  rate: number;
  estimatedDays: string;
  active: boolean;
}

const mockZones: ShippingZone[] = [
  {
    id: '1',
    name: 'Central Region',
    nameAr: 'المنطقة الوسطى',
    cities: ['الرياض', 'القصيم', 'حائل'],
    rate: 15,
    estimatedDays: '1-2 days',
    active: true,
  },
  {
    id: '2',
    name: 'Western Region', 
    nameAr: 'المنطقة الغربية',
    cities: ['جدة', 'مكة', 'الطائف', 'المدينة'],
    rate: 20,
    estimatedDays: '2-3 days',
    active: true,
  },
];

export default function ShippingZonesPage() {
  const [zones] = useState<ShippingZone[]>(mockZones);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-8 w-8 text-[#1B6D2F]" />
            Shipping Zones
          </h1>
          <p className="text-gray-600 mt-1">
            Manage delivery zones and shipping rates
          </p>
        </div>
        <Button className="bg-[#1B6D2F] hover:bg-[#145A26]">
          <Plus className="h-4 w-4 mr-2" />
          Add Zone
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Zones</CardTitle>
            <MapPin className="h-4 w-4 text-[#1B6D2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{zones.length}</div>
            <p className="text-xs text-gray-600">Shipping zones</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone</TableHead>
                <TableHead>Cities</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Delivery Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{zone.name}</div>
                      <div className="text-sm text-gray-500">{zone.nameAr}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{zone.cities.join(', ')}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">SAR {zone.rate}</div>
                  </TableCell>
                  <TableCell>{zone.estimatedDays}</TableCell>
                  <TableCell>
                    <Badge className={zone.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {zone.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}