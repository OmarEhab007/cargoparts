'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Package,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Listing {
  id: string;
  titleAr: string;
  titleEn: string | null;
  priceSar: number;
  make: string;
  model: string;
  fromYear: number;
  toYear: number;
  condition: string;
  city: string;
  createdAt: string;
  updatedAt: string;
  photos: { url: string }[];
}

export default function SellerListingsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchListings();
  }, []);
  
  const fetchListings = async () => {
    try {
      // For POC, fetch all listings (in real app, would filter by seller)
      const response = await fetch('/api/listings');
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setListings(listings.filter(listing => listing.id !== id));
        setDeleteId(null);
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };
  
  const getConditionLabel = (condition: string) => {
    const labels = {
      NEW: { en: 'New', ar: 'جديد' },
      USED: { en: 'Used', ar: 'مستعمل' },
      REFURBISHED: { en: 'Refurbished', ar: 'مجدد' },
    };
    return isArabic ? labels[condition as keyof typeof labels]?.ar : labels[condition as keyof typeof labels]?.en;
  };
  
  const getConditionVariant = (condition: string) => {
    switch (condition) {
      case 'NEW': return 'default';
      case 'USED': return 'secondary';
      case 'REFURBISHED': return 'outline';
      default: return 'secondary';
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          {isArabic ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isArabic ? 'إدارة القطع' : 'Manage Parts'}
        </h1>
        <Button asChild size="lg">
          <Link href={`/${locale}/seller/listings/new`}>
            <Plus className="me-2 h-4 w-4" />
            {isArabic ? 'إضافة قطعة جديدة' : 'Add New Part'}
          </Link>
        </Button>
      </div>
      
      {listings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">
              {isArabic ? 'لا توجد قطع بعد' : 'No parts yet'}
            </h2>
            <p className="mb-6 text-muted-foreground">
              {isArabic 
                ? 'ابدأ بإضافة أول قطعة غيار لديك'
                : 'Start by adding your first spare part'}
            </p>
            <Button asChild>
              <Link href={`/${locale}/seller/listings/new`}>
                <Plus className="me-2 h-4 w-4" />
                {isArabic ? 'إضافة قطعة' : 'Add Part'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {isArabic ? `القطع المتاحة (${listings.length})` : `Available Parts (${listings.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">
                      {isArabic ? 'القطعة' : 'Part'}
                    </TableHead>
                    <TableHead className="min-w-[150px]">
                      {isArabic ? 'السيارة' : 'Vehicle'}
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      {isArabic ? 'السعر' : 'Price'}
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      {isArabic ? 'الحالة' : 'Condition'}
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      {isArabic ? 'المدينة' : 'City'}
                    </TableHead>
                    <TableHead className="min-w-[150px] text-end">
                      {isArabic ? 'الإجراءات' : 'Actions'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {listing.photos[0] && (
                            <div className="h-12 w-12 rounded overflow-hidden relative">
                              <Image 
                                src={listing.photos[0].url} 
                                alt=""
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(listing.createdAt).toLocaleDateString(
                                isArabic ? 'ar-SA' : 'en-US'
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{listing.make} {listing.model}</p>
                          <p className="text-sm text-muted-foreground">
                            {listing.fromYear}-{listing.toYear}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {listing.priceSar.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                          <SARSymbol className="h-3 w-3" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getConditionVariant(listing.condition)}>
                          {getConditionLabel(listing.condition)}
                        </Badge>
                      </TableCell>
                      <TableCell>{listing.city}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <Link href={`/${locale}/shop/listing/${listing.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <Link href={`/${locale}/seller/listings/${listing.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(listing.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArabic ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic 
                ? 'هل أنت متأكد من حذف هذه القطعة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this part? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isArabic ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}