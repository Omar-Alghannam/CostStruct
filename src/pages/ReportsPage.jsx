/**
 * Reports Page (تقارير)
 * Analytics dashboard with AMCharts 5 interactive charts.
 * Features: Pie chart, Line chart, Drill-down, Budget vs Actual, CSV/PDF export.
 */
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToProjects } from '../services/projectService';
import { subscribeToExpenses, EXPENSE_CATEGORIES } from '../services/expenseService';
import { exportToCSV, exportToPDF } from '../services/exportService';

// AMCharts 5 imports
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5plugins_exporting from '@amcharts/amcharts5/plugins/exporting';

import { FiDownload, FiPieChart, FiTrendingUp, FiBarChart2, FiTarget } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isAr = i18n.language === 'ar';

  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('pie');

  const pieRef = useRef(null);
  const lineRef = useRef(null);
  const barRef = useRef(null);
  const drillRef = useRef(null);

  // Store root references for cleanup
  const rootRefs = useRef({});

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribeToProjects(user.uid, (data) => {
      setProjects(data);
      setLoading(false);
    }, (err) => {
      console.error('ReportsPage projects error:', err);
      setLoading(false);
    });
    const unsub2 = subscribeToExpenses(user.uid, setExpenses, (err) => {
      console.error('ReportsPage expenses error:', err);
    });
    return () => { unsub1(); unsub2(); };
  }, [user]);

  // Category data for pie chart
  const categoryData = Object.entries(EXPENSE_CATEGORIES)
    .map(([key, val]) => {
      const total = expenses.filter((e) => e.category_en === key).reduce((s, e) => s + (e.amount || 0), 0);
      return { category: isAr ? val.ar : val.en, value: total, key };
    })
    .filter((c) => c.value > 0);

  // Monthly data for line chart
  const monthlyData = (() => {
    const months = {};
    expenses.forEach((e) => {
      if (!e.date) return;
      const month = e.date.substring(0, 7); // YYYY-MM
      months[month] = (months[month] || 0) + (e.amount || 0);
    });
    const data = Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({ date: month, value }));

    // If only one month exists, pad it with the previous month (value 0)
    // so the line chart actually draws a trend line from 0.
    if (data.length === 1) {
      const [yearStr, monthStr] = data[0].date.split('-');
      let prevMonth = parseInt(monthStr, 10) - 1;
      let prevYear = parseInt(yearStr, 10);
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear -= 1;
      }
      const prevDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`;
      data.unshift({ date: prevDate, value: 0 });
    }

    return data;
  })();

  // Budget vs Actual data for bar chart
  const budgetVsActual = projects.map((p) => {
    const spent = expenses.filter((e) => e.projectId === p.id).reduce((s, e) => s + (e.amount || 0), 0);
    const budget = p.budget || 0;
    const utilization = budget > 0 ? (spent / budget) * 100 : 0;
    return {
      project: isAr ? p.name_ar || p.name_en : p.name_en,
      budget,
      actual: spent,
      utilization: parseFloat(utilization.toFixed(1)),
    };
  });

  // ===== PIE CHART =====
  useLayoutEffect(() => {
    if (activeChart !== 'pie' || !pieRef.current || categoryData.length === 0) return;

    // Dispose previous
    if (rootRefs.current.pie) rootRefs.current.pie.dispose();

    const root = am5.Root.new(pieRef.current);
    rootRefs.current.pie = root;

    root.setThemes([am5themes_Animated.new(root)]);

    // Add exporting plugin
    am5plugins_exporting.Exporting.new(root, {
      menu: am5plugins_exporting.ExportingMenu.new(root, {}),
    });

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(40),
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: 'value',
        categoryField: 'category',
        tooltip: am5.Tooltip.new(root, {
          labelText: '{category}: {value} ' + t('common.currency'),
        }),
      })
    );

    series.labels.template.setAll({ fontSize: 13, text: '{category}', fill: am5.color(0x555555) });
    series.slices.template.setAll({
      strokeWidth: 2,
      stroke: am5.color(0xffffff),
      cornerRadius: 6,
    });

    // Color palette (red-themed)
    series.set('colors', am5.ColorSet.new(root, {
      colors: [
        am5.color(0xC81E1E), am5.color(0xE84545), am5.color(0x2563EB),
        am5.color(0x10B981), am5.color(0xF59E0B), am5.color(0x8B5CF6),
        am5.color(0xEC4899), am5.color(0x06B6D4), am5.color(0xEF4444),
        am5.color(0x6366F1),
      ],
    }));

    series.data.setAll(categoryData);
    series.appear(1000, 100);

    const legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      marginTop: 15,
    }));
    legend.data.setAll(series.dataItems);

    return () => {
      if (rootRefs.current.pie) {
        rootRefs.current.pie.dispose();
        rootRefs.current.pie = null;
      }
    };
  }, [activeChart, categoryData.length, isAr]);

  // ===== LINE CHART (REFINE MEANING) =====
  useLayoutEffect(() => {
    if (activeChart !== 'line' || !lineRef.current || monthlyData.length === 0) return;

    if (rootRefs.current.line) rootRefs.current.line.dispose();

    const root = am5.Root.new(lineRef.current);
    rootRefs.current.line = root;

    root.setThemes([am5themes_Animated.new(root)]);

    am5plugins_exporting.Exporting.new(root, {
      menu: am5plugins_exporting.ExportingMenu.new(root, {}),
    });

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: false,
        wheelX: 'panX',
        wheelY: 'zoomX',
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'date',
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 60 }),
      })
    );
    xAxis.data.setAll(monthlyData);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        extraMax: 0.1,
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: t('reports.monthlyTrends'),
        xAxis,
        yAxis,
        valueYField: 'value',
        categoryXField: 'date',
        tooltip: am5.Tooltip.new(root, {
          labelText: '{categoryX}: [bold]{valueY}[/] ' + t('common.currency'),
        }),
      })
    );

    series.strokes.template.setAll({ strokeWidth: 4, stroke: am5.color(0xC81E1E) });
    series.fills.template.setAll({
      fillOpacity: 0.3,
      visible: true,
      fill: am5.color(0xC81E1E),
    });

    // Smoothed line
    series.set('curveFactory', am5.curveBasis);

    // Bullet points
    series.bullets.push(() => {
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 6,
          fill: am5.color(0xC81E1E),
          stroke: am5.color(0xffffff),
          strokeWidth: 3,
        }),
      });
    });

    series.data.setAll(monthlyData);

    chart.set('cursor', am5xy.XYCursor.new(root, { behavior: 'zoomX' }));
    series.appear(1000);

    return () => {
      if (rootRefs.current.line) {
        rootRefs.current.line.dispose();
      }
    };
  }, [activeChart, monthlyData.length, isAr]);

  // ===== BUDGET VS ACTUAL CHART (IMPROVED MEANING) =====
  useLayoutEffect(() => {
    if (activeChart !== 'budget' || !barRef.current || budgetVsActual.length === 0) return;

    if (rootRefs.current.bar) rootRefs.current.bar.dispose();

    const root = am5.Root.new(barRef.current);
    rootRefs.current.bar = root;

    root.setThemes([am5themes_Animated.new(root)]);

    am5plugins_exporting.Exporting.new(root, {
      menu: am5plugins_exporting.ExportingMenu.new(root, {}),
    });

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, { panX: false, panY: false, layout: root.verticalLayout })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'project',
        renderer: am5xy.AxisRendererX.new(root, { cellStartLocation: 0.1, cellEndLocation: 0.9, minGridDistance: 60 }),
      })
    );
    xAxis.data.setAll(budgetVsActual);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, {}) })
    );

    // Budget series (back)
    const budgetSeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: t('projects.budget'),
        xAxis, yAxis,
        valueYField: 'budget',
        categoryXField: 'project',
        clustered: false,
        tooltip: am5.Tooltip.new(root, { labelText: '{name}: {valueY} ' + t('common.currency') }),
      })
    );
    budgetSeries.columns.template.setAll({
      fillOpacity: 0.3,
      fill: am5.color(0x374151),
      strokeOpacity: 0,
      width: am5.percent(80),
    });
    budgetSeries.data.setAll(budgetVsActual);

    // Actual series (front)
    const actualSeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: t('projects.spent'),
        xAxis, yAxis,
        valueYField: 'actual',
        categoryXField: 'project',
        clustered: false,
        tooltip: am5.Tooltip.new(root, { 
          labelText: '[bold]{name}[/]: {valueY} ' + t('common.currency') + '\n[bold]{utilization}%[/] Used' 
        }),
      })
    );
    actualSeries.columns.template.setAll({
      cornerRadiusTL: 4, cornerRadiusTR: 4,
      width: am5.percent(60),
    });

    // Color-code: green if under budget, red if over
    actualSeries.columns.template.adapters.add('fill', (fill, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const val = dataItem.get('valueY', 0);
        const budData = budgetVsActual.find((b) => b.project === dataItem.get('categoryX'));
        if (budData && val > budData.budget) return am5.color(0xC81E1E); // Over budget
        if (budData && val > (budData.budget * 0.8)) return am5.color(0xF59E0B); // Near budget (80%+)
        return am5.color(0x10B981); // Within budget
      }
      return fill;
    });

    actualSeries.data.setAll(budgetVsActual);

    const legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.percent(50), x: am5.percent(50),
    }));
    legend.data.setAll(chart.series.values);

    chart.set('cursor', am5xy.XYCursor.new(root, {}));

    budgetSeries.appear(1000);
    actualSeries.appear(1000);

    return () => {
      if (rootRefs.current.bar) {
        rootRefs.current.bar.dispose();
        rootRefs.current.bar = null;
      }
    };
  }, [activeChart, budgetVsActual.length, isAr]);

  // ===== DRILL-DOWN CHART =====
  useLayoutEffect(() => {
    if (activeChart !== 'drilldown' || !drillRef.current || categoryData.length === 0) return;

    if (rootRefs.current.drill) rootRefs.current.drill.dispose();

    const root = am5.Root.new(drillRef.current);
    rootRefs.current.drill = root;

    root.setThemes([am5themes_Animated.new(root)]);

    am5plugins_exporting.Exporting.new(root, {
      menu: am5plugins_exporting.ExportingMenu.new(root, {}),
    });

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, { panX: false, panY: false, layout: root.verticalLayout })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'category',
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 60 }),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, {}) })
    );

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: t('reports.expensesByCategory'),
        xAxis, yAxis,
        valueYField: 'value',
        categoryXField: 'category',
        tooltip: am5.Tooltip.new(root, {
          labelText: '{category}: {valueY} ' + t('common.currency') + '\n(Click to drill down)',
        }),
      })
    );

    series.columns.template.setAll({
      cornerRadiusTL: 6, cornerRadiusTR: 6,
      strokeOpacity: 0, fill: am5.color(0xC81E1E),
      cursorOverStyle: 'pointer',
    });

    series.columns.template.adapters.add('fill', (fill, target) => {
      const colors = [0xC81E1E, 0x2563EB, 0x10B981, 0xF59E0B, 0x8B5CF6, 0xEC4899, 0x06B6D4, 0x6366F1, 0xEF4444, 0xF97316];
      const idx = series.columns.indexOf(target);
      return am5.color(colors[idx % colors.length]);
    });

    // Drill-down: click a category bar to see monthly breakdown for it
    series.columns.template.events.on('click', (ev) => {
      const dataItem = ev.target.dataItem;
      if (!dataItem) return;
      const categoryKey = categoryData.find((c) => c.category === dataItem.get('categoryX'))?.key;
      if (!categoryKey) return;

      // Build monthly breakdown for this category
      const monthlyForCat = {};
      expenses.forEach((e) => {
        if (e.category_en !== categoryKey || !e.date) return;
        const month = e.date.substring(0, 7);
        monthlyForCat[month] = (monthlyForCat[month] || 0) + (e.amount || 0);
      });
      const drillData = Object.entries(monthlyForCat)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, value]) => ({ category: month, value }));

      if (drillData.length > 0) {
        xAxis.data.setAll(drillData);
        series.data.setAll(drillData);

        // Add back button
        const backBtn = chart.plotContainer.children.push(
          am5.Button.new(root, {
            label: am5.Label.new(root, { text: '← Back', fontSize: 14 }),
            x: 10, y: 10,
            cursorOverStyle: 'pointer',
          })
        );
        backBtn.events.on('click', () => {
          xAxis.data.setAll(categoryData);
          series.data.setAll(categoryData);
          backBtn.dispose();
        });
      }
    });

    xAxis.data.setAll(categoryData);
    series.data.setAll(categoryData);
    series.appear(1000);

    return () => {
      if (rootRefs.current.drill) {
        rootRefs.current.drill.dispose();
        rootRefs.current.drill = null;
      }
    };
  }, [activeChart, categoryData.length, expenses.length, isAr]);

  // Cleanup all charts on unmount
  useEffect(() => {
    return () => {
      Object.values(rootRefs.current).forEach((r) => r && r.dispose());
    };
  }, []);

  // Export handlers
  const handleExportAllCSV = () => {
    const cols = [
      { header: t('expenses.description'), key: isAr ? 'description_ar' : 'description_en' },
      { header: t('expenses.category'), key: isAr ? 'category_ar' : 'category_en' },
      { header: t('expenses.amount'), key: 'amount' },
      { header: t('expenses.date'), key: 'date' },
      { header: t('expenses.paidTo'), key: 'paidTo' },
    ];
    exportToCSV(expenses, 'all_expenses_report', cols);
    toast.success(t('common.success'));
  };

  const handleExportAllPDF = () => {
    const cols = [
      { header: t('expenses.description'), key: isAr ? 'description_ar' : 'description_en' },
      { header: t('expenses.category'), key: isAr ? 'category_ar' : 'category_en' },
      { header: t('expenses.amount'), key: 'amount' },
      { header: t('expenses.date'), key: 'date' },
      { header: t('expenses.paidTo'), key: 'paidTo' },
    ];
    exportToPDF(expenses, 'all_expenses_report', t('reports.title'), cols);
    toast.success(t('common.success'));
  };

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner" /></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{t('reports.title')}</h1>
          <p className="page-subtitle">{t('reports.subtitle')}</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--secondary" onClick={handleExportAllCSV}>
            <FiDownload /> {t('reports.exportCSV')}
          </button>
          <button className="btn btn--secondary" onClick={handleExportAllPDF}>
            <FiDownload /> {t('reports.exportPDF')}
          </button>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="chart-tabs">
        <button
          className={`chart-tab ${activeChart === 'pie' ? 'chart-tab--active' : ''}`}
          onClick={() => setActiveChart('pie')}
        >
          <FiPieChart /> {t('reports.expensesByCategory')}
        </button>
        <button
          className={`chart-tab ${activeChart === 'line' ? 'chart-tab--active' : ''}`}
          onClick={() => setActiveChart('line')}
        >
          <FiTrendingUp /> {t('reports.monthlyTrends')}
        </button>
        <button
          className={`chart-tab ${activeChart === 'budget' ? 'chart-tab--active' : ''}`}
          onClick={() => setActiveChart('budget')}
        >
          <FiBarChart2 /> {t('reports.budgetVsActual')}
        </button>
        <button
          className={`chart-tab ${activeChart === 'drilldown' ? 'chart-tab--active' : ''}`}
          onClick={() => setActiveChart('drilldown')}
        >
          <FiTarget /> {t('reports.drillDown')}
        </button>
      </div>

      {/* Chart Containers */}
      <div className="chart-container card">
        {activeChart === 'pie' && (
          <div>
            <h3 className="card__title">{t('reports.expensesByCategory')}</h3>
            {categoryData.length > 0 ? (
              <div ref={pieRef} className="chart-canvas" />
            ) : (
              <p className="text-muted text-center">{t('common.noData')}</p>
            )}
          </div>
        )}

        {activeChart === 'line' && (
          <div>
            <h3 className="card__title">{t('reports.monthlyTrends')}</h3>
            {monthlyData.length > 0 ? (
              <div ref={lineRef} className="chart-canvas" />
            ) : (
              <p className="text-muted text-center">{t('common.noData')}</p>
            )}
          </div>
        )}

        {activeChart === 'budget' && (
          <div>
            <h3 className="card__title">{t('reports.budgetVsActual')}</h3>
            {budgetVsActual.length > 0 ? (
              <div ref={barRef} className="chart-canvas" />
            ) : (
              <p className="text-muted text-center">{t('common.noData')}</p>
            )}
          </div>
        )}

        {activeChart === 'drilldown' && (
          <div>
            <h3 className="card__title">{t('reports.drillDown')}</h3>
            <p className="chart-hint">
              {isAr ? 'اضغط على أي فئة لعرض التفاصيل الشهرية' : 'Click any category bar to see monthly breakdown'}
            </p>
            {categoryData.length > 0 ? (
              <div ref={drillRef} className="chart-canvas" />
            ) : (
              <p className="text-muted text-center">{t('common.noData')}</p>
            )}
          </div>
        )}
      </div>

      {/* Summary Table */}
      <div className="card">
        <h3 className="card__title">{t('reports.summary')}</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('expenses.category')}</th>
              <th>{t('expenses.total')}</th>
              <th>% {t('reports.ofTotal')}</th>
            </tr>
          </thead>
          <tbody>
            {categoryData.map((c) => {
              const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
              const pct = total > 0 ? ((c.value / total) * 100).toFixed(1) : 0;
              return (
                <tr key={c.key}>
                  <td>{c.category}</td>
                  <td className="font-bold">{c.value.toLocaleString()} {t('common.currency')}</td>
                  <td>
                    <div className="progress-bar-mini">
                      <div className="progress-bar-mini__inner" style={{ width: `${pct}%` }} />
                      <span>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {categoryData.length > 0 && (
            <tfoot>
              <tr>
                <th className="text-left">{t('common.total')}</th>
                <th className="text-left">{expenses.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString()} {t('common.currency')}</th>
                <th>100%</th>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
