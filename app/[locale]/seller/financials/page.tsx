'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet,
  Download, Upload, Calendar, Filter, Search, FileText,
  AlertCircle, CheckCircle, Clock, XCircle, ArrowUpRight,
  ArrowDownRight, Receipt, Banknote, PiggyBank, Calculator,
  Building, Users, Package, ChevronRight, Info, RefreshCw
} from 'lucide-react';

// Financial overview data
const financialSummary = {
  totalRevenue: 892450,
  netProfit: 267735,
  profitMargin: 30,
  pendingPayouts: 45320,
  availableBalance: 222415,
  totalTransactions: 1245,
  avgTransactionValue: 717,
  totalFees: 44622,
};

// Monthly financial data
const monthlyFinancials = [
  { month: 'Jan', revenue: 65000, expenses: 45000, profit: 20000 },
  { month: 'Feb', revenue: 72000, expenses: 48000, profit: 24000 },
  { month: 'Mar', revenue: 68000, expenses: 46000, profit: 22000 },
  { month: 'Apr', revenue: 81000, expenses: 54000, profit: 27000 },
  { month: 'May', revenue: 78000, expenses: 52000, profit: 26000 },
  { month: 'Jun', revenue: 92000, expenses: 61000, profit: 31000 },
];

// Transaction history
const transactions = [
  {
    id: 'TRX-001',
    date: '2024-01-15',
    type: 'sale',
    description: 'Order #ORD-789',
    amount: 1250,
    status: 'completed',
    customer: 'Ahmed Ali',
    paymentMethod: 'Credit Card',
    fee: 37.50,
    net: 1212.50,
  },
  {
    id: 'TRX-002',
    date: '2024-01-14',
    type: 'refund',
    description: 'Refund for Order #ORD-456',
    amount: -350,
    status: 'completed',
    customer: 'Sara Mohammed',
    paymentMethod: 'Credit Card',
    fee: 0,
    net: -350,
  },
  {
    id: 'TRX-003',
    date: '2024-01-14',
    type: 'sale',
    description: 'Order #ORD-123',
    amount: 2100,
    status: 'pending',
    customer: 'Omar Hassan',
    paymentMethod: 'Bank Transfer',
    fee: 63,
    net: 2037,
  },
  {
    id: 'TRX-004',
    date: '2024-01-13',
    type: 'payout',
    description: 'Weekly Payout',
    amount: 15000,
    status: 'completed',
    customer: '-',
    paymentMethod: 'Bank Transfer',
    fee: 50,
    net: 14950,
  },
  {
    id: 'TRX-005',
    date: '2024-01-13',
    type: 'sale',
    description: 'Order #ORD-987',
    amount: 890,
    status: 'completed',
    customer: 'Fatima Abdullah',
    paymentMethod: 'Apple Pay',
    fee: 26.70,
    net: 863.30,
  },
];

// Payout history
const payouts = [
  {
    id: 'PAY-001',
    date: '2024-01-14',
    amount: 15000,
    status: 'completed',
    bankAccount: '****1234',
    reference: 'REF-2024-001',
  },
  {
    id: 'PAY-002',
    date: '2024-01-07',
    amount: 18500,
    status: 'completed',
    bankAccount: '****1234',
    reference: 'REF-2024-002',
  },
  {
    id: 'PAY-003',
    date: '2023-12-31',
    amount: 22000,
    status: 'completed',
    bankAccount: '****1234',
    reference: 'REF-2023-052',
  },
];

// Revenue breakdown
const revenueBreakdown = [
  { category: 'Engine Parts', value: 35, amount: 312075 },
  { category: 'Body Parts', value: 25, amount: 223112 },
  { category: 'Electrical', value: 20, amount: 178490 },
  { category: 'Suspension', value: 12, amount: 107094 },
  { category: 'Other', value: 8, amount: 71396 },
];

// Expense categories
const expenseCategories = [
  { category: 'Platform Fees', amount: 44622, percentage: 35 },
  { category: 'Shipping', amount: 31850, percentage: 25 },
  { category: 'Storage', amount: 19110, percentage: 15 },
  { category: 'Marketing', amount: 15288, percentage: 12 },
  { category: 'Operations', amount: 10192, percentage: 8 },
  { category: 'Other', amount: 6370, percentage: 5 },
];

export default function SellerFinancialsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  const formatCurrency = (value: number) => {
    return Math.abs(value).toLocaleString(isArabic ? 'ar-SA' : 'en-US');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default' as const, icon: CheckCircle, label: isArabic ? 'مكتمل' : 'Completed' },
      pending: { variant: 'secondary' as const, icon: Clock, label: isArabic ? 'معلق' : 'Pending' },
      failed: { variant: 'destructive' as const, icon: XCircle, label: isArabic ? 'فشل' : 'Failed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 me-1" />
        {config.label}
      </Badge>
    );
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case 'refund':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'payout':
        return <Banknote className="h-4 w-4 text-blue-500" />;
      default:
        return <Receipt className="h-4 w-4 text-gray-500" />;
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isArabic ? 'المالية والمدفوعات' : 'Financials & Payments'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة أموالك ومعاملاتك المالية' : 'Manage your money and financial transactions'}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{isArabic ? 'أسبوع' : 'Week'}</SelectItem>
              <SelectItem value="month">{isArabic ? 'شهر' : 'Month'}</SelectItem>
              <SelectItem value="quarter">{isArabic ? 'ربع سنة' : 'Quarter'}</SelectItem>
              <SelectItem value="year">{isArabic ? 'سنة' : 'Year'}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 me-2" />
            {isArabic ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'الرصيد المتاح' : 'Available Balance'}
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {formatCurrency(financialSummary.availableBalance)}
              <SARSymbol className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isArabic ? 'جاهز للسحب' : 'Ready for withdrawal'}
            </p>
            <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full mt-3">
                  {isArabic ? 'طلب سحب' : 'Request Payout'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isArabic ? 'طلب سحب الأموال' : 'Request Payout'}</DialogTitle>
                  <DialogDescription>
                    {isArabic 
                      ? 'أدخل المبلغ الذي تريد سحبه إلى حسابك البنكي'
                      : 'Enter the amount you want to withdraw to your bank account'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>{isArabic ? 'المبلغ المتاح' : 'Available Amount'}</Label>
                    <div className="text-2xl font-bold flex items-center gap-1 mt-1">
                      {formatCurrency(financialSummary.availableBalance)}
                      <SARSymbol className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="payout-amount">{isArabic ? 'مبلغ السحب' : 'Payout Amount'}</Label>
                    <Input
                      id="payout-amount"
                      type="number"
                      placeholder={isArabic ? 'أدخل المبلغ' : 'Enter amount'}
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{isArabic ? 'الحساب البنكي' : 'Bank Account'}</Label>
                    <Select defaultValue="default">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">
                          {isArabic ? 'الراجحي - ****1234' : 'Al Rajhi - ****1234'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {isArabic 
                        ? 'سيتم معالجة طلب السحب خلال 1-3 أيام عمل'
                        : 'Payout will be processed within 1-3 business days'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        setShowPayoutDialog(false);
                        setPayoutAmount('');
                      }}
                    >
                      {isArabic ? 'تأكيد الطلب' : 'Confirm Request'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowPayoutDialog(false);
                        setPayoutAmount('');
                      }}
                    >
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'المدفوعات المعلقة' : 'Pending Payouts'}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {formatCurrency(financialSummary.pendingPayouts)}
              <SARSymbol className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isArabic ? 'في انتظار المعالجة' : 'Awaiting processing'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {formatCurrency(financialSummary.totalRevenue)}
              <SARSymbol className="h-5 w-5" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 me-1" />
              <span className="text-sm text-green-500">+15.2%</span>
              <span className="text-sm text-muted-foreground ms-2">
                {isArabic ? 'من الشهر الماضي' : 'from last month'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'صافي الربح' : 'Net Profit'}
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {formatCurrency(financialSummary.netProfit)}
              <SARSymbol className="h-5 w-5" />
            </div>
            <Progress value={financialSummary.profitMargin} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {financialSummary.profitMargin}% {isArabic ? 'هامش الربح' : 'profit margin'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{isArabic ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
          <TabsTrigger value="transactions">{isArabic ? 'المعاملات' : 'Transactions'}</TabsTrigger>
          <TabsTrigger value="payouts">{isArabic ? 'المدفوعات' : 'Payouts'}</TabsTrigger>
          <TabsTrigger value="expenses">{isArabic ? 'المصروفات' : 'Expenses'}</TabsTrigger>
          <TabsTrigger value="reports">{isArabic ? 'التقارير' : 'Reports'}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'الإيرادات والأرباح' : 'Revenue & Profit'}</CardTitle>
                <CardDescription>
                  {isArabic ? 'أداء مالي شهري' : 'Monthly financial performance'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyFinancials}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" name={isArabic ? 'الإيرادات' : 'Revenue'} />
                    <Area type="monotone" dataKey="profit" stackId="1" stroke="#10b981" fill="#10b981" name={isArabic ? 'الربح' : 'Profit'} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'توزيع الإيرادات' : 'Revenue Breakdown'}</CardTitle>
                <CardDescription>
                  {isArabic ? 'حسب فئة المنتج' : 'By product category'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, value }) => `${category}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Financial Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'إجمالي المعاملات' : 'Total Transactions'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{financialSummary.totalTransactions}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isArabic ? 'متوسط' : 'Average'}: {formatCurrency(financialSummary.avgTransactionValue)} SAR
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'إجمالي الرسوم' : 'Total Fees'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-1">
                  {formatCurrency(financialSummary.totalFees)}
                  <SARSymbol className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  5% {isArabic ? 'من الإيرادات' : 'of revenue'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'معدل النمو' : 'Growth Rate'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-500 me-1" />
                  18.5%
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isArabic ? 'مقارنة بالربع السابق' : 'vs previous quarter'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{isArabic ? 'سجل المعاملات' : 'Transaction History'}</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={isArabic ? 'بحث...' : 'Search...'}
                      className="ps-9 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                      <SelectItem value="completed">{isArabic ? 'مكتمل' : 'Completed'}</SelectItem>
                      <SelectItem value="pending">{isArabic ? 'معلق' : 'Pending'}</SelectItem>
                      <SelectItem value="failed">{isArabic ? 'فشل' : 'Failed'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead>{isArabic ? 'النوع' : 'Type'}</TableHead>
                    <TableHead>{isArabic ? 'الوصف' : 'Description'}</TableHead>
                    <TableHead>{isArabic ? 'العميل' : 'Customer'}</TableHead>
                    <TableHead>{isArabic ? 'المبلغ' : 'Amount'}</TableHead>
                    <TableHead>{isArabic ? 'الرسوم' : 'Fee'}</TableHead>
                    <TableHead>{isArabic ? 'الصافي' : 'Net'}</TableHead>
                    <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          <span className="capitalize">{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>
                        <span className={transaction.amount < 0 ? 'text-red-500' : ''}>
                          {transaction.amount < 0 ? '-' : '+'}{formatCurrency(transaction.amount)} SAR
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(transaction.fee)} SAR</TableCell>
                      <TableCell className="font-medium">
                        {transaction.net < 0 ? '-' : '+'}{formatCurrency(transaction.net)} SAR
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{isArabic ? 'سجل المدفوعات' : 'Payout History'}</CardTitle>
                <Button>
                  <Banknote className="h-4 w-4 me-2" />
                  {isArabic ? 'طلب دفعة جديدة' : 'Request New Payout'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead>{isArabic ? 'المرجع' : 'Reference'}</TableHead>
                    <TableHead>{isArabic ? 'المبلغ' : 'Amount'}</TableHead>
                    <TableHead>{isArabic ? 'الحساب البنكي' : 'Bank Account'}</TableHead>
                    <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead>{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>{new Date(payout.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}</TableCell>
                      <TableCell className="font-mono">{payout.reference}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          {formatCurrency(payout.amount)}
                          <SARSymbol className="h-4 w-4" />
                        </div>
                      </TableCell>
                      <TableCell>{payout.bankAccount}</TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 me-2" />
                          {isArabic ? 'الإيصال' : 'Receipt'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payout Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إعدادات الدفع' : 'Payout Settings'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>{isArabic ? 'جدول الدفع' : 'Payout Schedule'}</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{isArabic ? 'يومي' : 'Daily'}</SelectItem>
                      <SelectItem value="weekly">{isArabic ? 'أسبوعي' : 'Weekly'}</SelectItem>
                      <SelectItem value="monthly">{isArabic ? 'شهري' : 'Monthly'}</SelectItem>
                      <SelectItem value="manual">{isArabic ? 'يدوي' : 'Manual'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isArabic ? 'الحد الأدنى للدفع' : 'Minimum Payout'}</Label>
                  <Input
                    type="number"
                    defaultValue="500"
                    className="mt-1"
                  />
                </div>
              </div>
              <Button className="w-full sm:w-auto">
                {isArabic ? 'حفظ الإعدادات' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'تفاصيل المصروفات' : 'Expense Breakdown'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseCategories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#ef4444" name={isArabic ? 'المبلغ' : 'Amount'} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-4">
                {expenseCategories.map((expense) => (
                  <div key={expense.category} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{expense.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(expense.amount)} SAR ({expense.percentage}%)
                        </span>
                      </div>
                      <Progress value={expense.percentage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'التقارير المالية' : 'Financial Reports'}</CardTitle>
              <CardDescription>
                {isArabic ? 'قم بتنزيل التقارير المالية التفصيلية' : 'Download detailed financial reports'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    title: isArabic ? 'بيان الدخل' : 'Income Statement',
                    description: isArabic ? 'ملخص الإيرادات والمصروفات' : 'Summary of revenue and expenses',
                    icon: FileText,
                  },
                  {
                    title: isArabic ? 'تقرير المبيعات' : 'Sales Report',
                    description: isArabic ? 'تفاصيل جميع المبيعات والمعاملات' : 'Details of all sales and transactions',
                    icon: Receipt,
                  },
                  {
                    title: isArabic ? 'تقرير الضرائب' : 'Tax Report',
                    description: isArabic ? 'معلومات ضريبية للإقرار' : 'Tax information for filing',
                    icon: Calculator,
                  },
                  {
                    title: isArabic ? 'تقرير المدفوعات' : 'Payout Report',
                    description: isArabic ? 'سجل جميع المدفوعات والتحويلات' : 'Record of all payouts and transfers',
                    icon: Banknote,
                  },
                ].map((report) => {
                  const Icon = report.icon;
                  return (
                    <Card key={report.title}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{report.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                            <Button variant="outline" size="sm" className="w-full">
                              <Download className="h-4 w-4 me-2" />
                              {isArabic ? 'تنزيل PDF' : 'Download PDF'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}