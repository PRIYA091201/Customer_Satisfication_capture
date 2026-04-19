import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert, Table, Input, Tag, Tooltip, Button } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const { Search } = Input;

interface DashboardStats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  averageEmoji: 'sad' | 'neutral' | 'happy' | null;
}

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [currentTableData, setCurrentTableData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch Stats
        const { count: total, error: err1 } = await supabase
          .from('customer_feedback')
          .select('*', { count: 'exact', head: true });
        if (err1) throw err1;

        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const { count: thisMonth, error: err2 } = await supabase
          .from('customer_feedback')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth);
        if (err2) throw err2;

        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        const { count: thisWeek, error: err3 } = await supabase
          .from('customer_feedback')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfWeek.toISOString());
        if (err3) throw err3;

        const { data: ratings, error: err4 } = await supabase.from('customer_feedback').select('rating');
        if (err4) throw err4;

        let averageEmoji: 'sad' | 'neutral' | 'happy' | null = null;
        if (ratings && ratings.length > 0) {
          const scores = ratings.map(r => r.rating === 'happy' ? 3 : r.rating === 'neutral' ? 2 : 1);
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          if (avg >= 2.5) averageEmoji = 'happy';
          else if (avg <= 1.5) averageEmoji = 'sad';
          else averageEmoji = 'neutral';
        }

        setStats({
          total: total || 0,
          thisMonth: thisMonth || 0,
          thisWeek: thisWeek || 0,
          averageEmoji
        });

        // Fetch Table Data
        const { data: tableData, error: err5 } = await supabase
          .from('customer_feedback')
          .select('*')
          .order('created_at', { ascending: false });

        if (err5) throw err5;
        setFeedbacks(tableData || []);

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getEmojiDisplay = (rating: 'sad' | 'neutral' | 'happy' | null) => {
    switch (rating) {
      case 'happy': return '😊 Happy';
      case 'neutral': return '😐 Neutral';
      case 'sad': return '😢 Sad';
      default: return 'N/A';
    }
  };

  // Extract unique values for column filters
  const getFilters = (dataIndex: string) => {
    const uniqueVals = Array.from(new Set(feedbacks.map((f: any) => f[dataIndex]).filter(Boolean)));
    return uniqueVals.map((val: any) => ({ text: val, value: val }));
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleDateString(),
      sorter: (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      filters: getFilters('section'),
      onFilter: (value: any, record: any) => record.section === value,
      render: (text: string) => text || '-',
    },
    {
      title: 'Branch',
      dataIndex: 'branch',
      key: 'branch',
      filters: getFilters('branch'),
      onFilter: (value: any, record: any) => record.branch === value,
      render: (text: string) => text || '-',
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      filters: getFilters('product'),
      onFilter: (value: any, record: any) => record.product === value,
      render: (text: string) => text || '-',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: string) => (
        <Tag color={rating === 'happy' ? 'success' : rating === 'sad' ? 'error' : 'warning'}>
          {rating === 'happy' ? '😊 Happy' : rating === 'sad' ? '😢 Sad' : '😐 Neutral'}
        </Tag>
      ),
      filters: [
        { text: 'Happy', value: 'happy' },
        { text: 'Neutral', value: 'neutral' },
        { text: 'Sad', value: 'sad' },
      ],
      onFilter: (value: any, record: any) => record.rating === value,
    },
    {
      title: 'Review',
      dataIndex: 'review',
      key: 'review',
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="truncate max-w-[200px]">{text || '-'}</div>
        </Tooltip>
      )
    },
    {
      title: 'Age Group',
      dataIndex: 'age_group',
      key: 'age_group',
      render: (text: string) => text || '-',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (text: string) => text || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button type="link" size="small" onClick={() => console.log('View', record.id)}>View</Button>
      )
    }
  ];

  // Apply free-text search filter
  const filteredFeedbacks = feedbacks.filter(f => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    const nameMatch = f.name?.toLowerCase().includes(searchLower) || false;
    const emailMatch = f.email?.toLowerCase().includes(searchLower) || false;
    const reviewMatch = f.review?.toLowerCase().includes(searchLower) || false;
    return nameMatch || emailMatch || reviewMatch;
  });

  useEffect(() => {
    setCurrentTableData(filteredFeedbacks);
  }, [feedbacks, searchText]);

  const handleTableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
    setCurrentTableData(extra.currentDataSource);
  };

  const handleExportCSV = () => {
    if (currentTableData.length === 0) return;

    // Define CSV headers (FR-40: id, date, name, email, rating, branch, message, section)
    const headers = ['id', 'date', 'name', 'email', 'rating', 'branch', 'message', 'section'];
    
    const csvContent = [
      headers.join(','),
      ...currentTableData.map(row => {
        return [
          row.id,
          row.created_at,
          `"${row.name || ''}"`,
          `"${row.email || ''}"`,
          row.rating,
          `"${row.branch || ''}"`,
          `"${(row.review || '').replace(/"/g, '""')}"`,
          `"${row.section || ''}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg shadow-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FB</span>
                </div>
                <span className="ml-3 font-semibold text-gray-900 text-lg">Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
              <button
                onClick={signOut}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Summary Statistics</h1>
        </div>

        {error && (
          <Alert message="Error" description={error} type="error" showIcon className="mb-6" />
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Row gutter={[24, 24]} className="mb-10">
              <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-sm border-gray-200">
                  <Statistic 
                    title="Total Feedback" 
                    value={stats?.total} 
                    valueStyle={{ fontSize: '2rem', fontWeight: 600, color: '#4F46E5' }} 
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-sm border-gray-200">
                  <Statistic 
                    title="Average Rating" 
                    value={getEmojiDisplay(stats?.averageEmoji || null)} 
                    valueStyle={{ fontSize: '1.75rem' }} 
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-sm border-gray-200">
                  <Statistic 
                    title="This Week" 
                    value={stats?.thisWeek} 
                    valueStyle={{ fontSize: '2rem', fontWeight: 600, color: '#10B981' }} 
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-sm border-gray-200">
                  <Statistic 
                    title="This Month" 
                    value={stats?.thisMonth} 
                    valueStyle={{ fontSize: '2rem', fontWeight: 600, color: '#3B82F6' }} 
                  />
                </Card>
              </Col>
            </Row>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Feedback Entries</h2>
                <div className="flex space-x-4">
                  <Search
                    placeholder="Search name, email, or review..."
                    allowClear
                    onSearch={(val) => setSearchText(val)}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                  />
                  <Button type="primary" onClick={handleExportCSV}>Export CSV</Button>
                </div>
              </div>

              <Table 
                columns={columns} 
                dataSource={filteredFeedbacks} 
                rowKey="id"
                pagination={{ pageSize: 20 }}
                scroll={{ x: 'max-content' }}
                onChange={handleTableChange}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
