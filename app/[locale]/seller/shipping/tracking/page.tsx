'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Truck, Package, CheckCircle, Clock } from 'lucide-react';

interface Shipment {
  id: string;
  orderId: string;
  customerName: string;
  destination: string;
  provider: string;
  status: 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered';
  trackingNumber: string;
  estimatedDelivery: string;
  lastUpdate: string;
}

const mockShipments: Shipment[] = [
  {
    id: '1',
    orderId: 'ORD2024-156',
    customerName: 'أحمد السعود',
    destination: 'الرياض',
    provider: 'SMSA Express',
    status: 'in_transit',
    trackingNumber: 'SM123456789',
    estimatedDelivery: '2024-02-03',
    lastUpdate: '2024-02-01T14:30:00Z',
  },
];

export default function ShippingTrackingPage() {
  const [shipments] = useState<Shipment[]>(mockShipments);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'out_for_delivery': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-8 w-8 text-[#1B6D2F]" />
            Track Shipments
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor delivery status and tracking information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
            <Truck className="h-4 w-4 text-[#1B6D2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shipments.length}</div>
            <p className="text-xs text-gray-600">In progress</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Est. Delivery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-medium">{shipment.orderId}</TableCell>
                  <TableCell>{shipment.customerName}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {shipment.destination}
                    </div>
                  </TableCell>
                  <TableCell>{shipment.provider}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(shipment.status)}>
                      {shipment.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{shipment.trackingNumber}</TableCell>
                  <TableCell>{new Date(shipment.estimatedDelivery).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}