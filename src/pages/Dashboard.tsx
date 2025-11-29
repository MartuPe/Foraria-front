import {
  AssessmentOutlined,
  EventAvailableOutlined,
  EventNoteOutlined,
  GroupOutlined,
  PersonAddAlt1Outlined,
  ReportProblemOutlined,
  RequestQuoteOutlined,
  SavingsOutlined
} from '@mui/icons-material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import EventIcon from '@mui/icons-material/Event'
import ForumIcon from '@mui/icons-material/Forum'
import HowToVoteIcon from '@mui/icons-material/HowToVote'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import PaymentsIcon from '@mui/icons-material/Payments'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import { Box, Button, Chip, Grid, Paper, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Money from '../components/Money'
import QuickAction from '../components/QuickAction'
import PageHeader from '../components/SectionHeader'
import BarsChart from '../components/charts/Bar'
import DonutChart from '../components/charts/Donut'
import { Role } from '../constants/roles'
import { AdminDashboardData, AdminTask, fetchAdminDashboard, RecentActivity } from '../services/adminDashboardService'
import { DashboardData, ExpenseCategory, fetchDashboard } from '../services/dashboardService'
import '../styles/dashboard.css'
import { storage } from '../utils/storage'

type PriorityLevel = 'Alta' | 'Media' | 'Baja' | 'Pendiente' | 'Completado' | 'Programado'

const PriorityChip: React.FC<{ level: PriorityLevel }> = ({ level }) => {
  const map: Record<PriorityLevel, 'error' | 'warning' | 'default' | 'success' | 'info'> = {
    Alta: 'error',
    Media: 'warning',
    Baja: 'default',
    Pendiente: 'warning',
    Completado: 'success',
    Programado: 'info'
  }
  return <Chip size='small' label={level} color={map[level] ?? 'default'} variant='outlined' />
}

const ActivityItem: React.FC<{ item: RecentActivity }> = ({ item }) => (
  <div className={`lineitem lineitem--${item.type}`}>
    <div className='lineitem__content'>
      <div className='lineitem__title'>{item.title}</div>
      <div className='lineitem__meta'>
        {item.when} · <PriorityChip level={item.status} />
      </div>
    </div>
  </div>
)

const TaskItem: React.FC<{ task: AdminTask }> = ({ task }) => (
  <div className='taskitem'>
    <div className='taskitem__title'>{task.title}</div>
    <div className='taskitem__meta'>
      {task.when} · <PriorityChip level={task.priority} />
    </div>
  </div>
)

export default function DashboardPage() {
  const navigate = useNavigate()
  const role = storage.role as Role | undefined
  const isAdminRole = role === Role.ADMIN || role === Role.CONSORCIO

  const [userData, setUserData] = useState<DashboardData | null>(null)
  const [adminData, setAdminData] = useState<AdminDashboardData | null>(null)
  const [adminExpenseBreakdown, setAdminExpenseBreakdown] = useState<ExpenseCategory[]>([])

  useEffect(() => {
    if (isAdminRole) {
      fetchAdminDashboard().then(setAdminData)
      fetchDashboard().then((data) => {
        setAdminExpenseBreakdown(data.expenseBreakdown)
      })
    } else {
      fetchDashboard().then(setUserData)
    }
  }, [isAdminRole])

  if (isAdminRole && !adminData) {
    return (
      <Box className='foraria-page-container'>
        <div className='page-loading'>Cargando dashboard…</div>
      </Box>
    )
  }

  if (!isAdminRole && !userData) {
    return (
      <Box className='foraria-page-container'>
        <div className='page-loading'>Cargando dashboard…</div>
      </Box>
    )
  }

  if (isAdminRole && adminData) {
    const { header, kpis, recentActivity, tasks } = adminData

    return (
      <Box className='foraria-page-container'>
        <PageHeader
          title={header.title}
          stats={[
            {
              icon: <GroupOutlined />,
              title: 'Total Usuarios',
              value: String(kpis.totalUsers),
              color: 'primary'
            },
            {
              icon: <ReportProblemOutlined />,
              title: 'Reclamos Pendientes',
              value: String(kpis.pendingClaims),
              color: 'warning'
            },
            {
              icon: <SavingsOutlined />,
              title: '% Expensas Cobradas',
              value: `${kpis.collectedRate}%`,
              color: 'success'
            },
            {
              icon: <EventAvailableOutlined />,
              title: 'Próximas Reservas',
              value: `${kpis.nextReservation.summary} - ${kpis.nextReservation.when}`,
              color: 'secondary'
            }
          ]}
        />

        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, mb: 2 }} variant='outlined'>
          <Typography variant='h6' sx={{ mb: 1.5, fontWeight: 700 }}>
            Acciones Rápidas
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <QuickAction
                to='/admin/gestionUsuario'
                icon={<PersonAddAlt1Outlined color='primary' />}
                title='Nuevo Usuario'
                subtitle='Crear cuenta'
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <QuickAction
                to='/admin/expensas'
                icon={<RequestQuoteOutlined color='warning' />}
                title='Cargar Gasto'
                subtitle='Agregar gasto / factura'
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <QuickAction
                to='/admin/reuniones'
                icon={<EventNoteOutlined color='secondary' />}
                title='Nueva Reunión'
                subtitle='Programar asamblea'
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <QuickAction
                to='/admin/votaciones'
                icon={<AssessmentOutlined color='success' />}
                title='Ver Votaciones'
                subtitle='Gestionar votación'
              />
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper className='panel' variant='outlined' sx={{ borderRadius: 3 }}>
              <Box className='panel__head'>
                <h4>Actividad Reciente</h4>
              </Box>

              <Box className='panel__content'>
                <div className='list'>
                  {recentActivity.map((it) => (
                    <ActivityItem key={it.id} item={it} />
                  ))}
                </div>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper className='panel' variant='outlined' sx={{ borderRadius: 3 }}>
              <Box className='panel__head'>
                <h4>Tareas Pendientes</h4>
              </Box>

              <Box className='panel__content'>
                <div className='list'>
                  {tasks.items.map((t) => (
                    <TaskItem key={t.id} task={t} />
                  ))}
                </div>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button variant='outlined' href='/admin/tareas'>
                    Ver Todas las Tareas
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper className='panel' variant='outlined' sx={{ borderRadius: 3 }}>
              <Box className='panel__head'>
                <h4>Desglose de Gastos del Consorcio</h4>
              </Box>

              <div className='panel__content two'>
                <DonutChart
                  data={(adminExpenseBreakdown.length
                    ? adminExpenseBreakdown
                    : [{ label: 'Sin datos', value: 100, color: '#e5e7eb' }]
                  ).map((s) => ({ ...s, color: s.color ?? '#aaaaaaff' }))}
                />

                <ul className='legend'>
                  {(adminExpenseBreakdown.length
                    ? adminExpenseBreakdown
                    : [{ label: 'Sin datos', value: 100, color: '#e5e7eb' }]
                  ).map((s) => {
                    const raw = s.value
                    const cleaned = String(raw).replace('%', '').trim()
                    const num = Number(cleaned)
                    const display = Number.isFinite(num) ? Math.floor(num) : raw
                    return (
                      <li key={s.label}>
                        <span className='dot' style={{ background: s.color ?? '#aaaaaaff' }} />
                        {s.label}{' '}
                        <span className='muted' title={`${raw}%`}>
                          {display}%
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    )
  }

  const { header, kpis, paymentStatus, expenseBreakdown, pendingBills, paymentsHistory, totals } =
    userData as DashboardData

  const paymentSum = paymentStatus.reduce((acc, s) => acc + (Number(s.value) || 0), 0)
  const paymentData = paymentSum > 0 ? paymentStatus : [{ label: 'Sin datos', value: 100, color: '#e5e7eb' }]

  return (
    <Box className='foraria-page-container'>
      <PageHeader
        title={header.welcomeTitle}
        stats={[
          {
            icon: <ReceiptLongIcon />,
            title: 'Expensas del Mes',
            value: (
              <span className='accent'>
                <Money value={kpis.expensesThisMonth} />
              </span>
            ) as unknown as string,
            color: 'warning'
          },
          {
            icon: <HowToVoteIcon />,
            title: 'Votaciones Activas',
            value: String(kpis.activePolls),
            color: 'primary',
            onClick: () => navigate('/votaciones')
          },
          {
            icon: <EventIcon />,
            title: 'Reservas Activas',
            value: String(kpis.activeBookings),
            color: 'secondary'
          },
          {
            icon: <NotificationsActiveIcon />,
            title: 'Noticias / Informes',
            value: String(kpis.notifications),
            color: 'info'
          }
        ]}
      />

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, mb: 2 }} variant='outlined'>
        <Typography variant='h6' sx={{ mb: 1.5, fontWeight: 700 }}>
          Acciones Rápidas
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <QuickAction
              to='/calendario'
              icon={<CalendarMonthIcon color='primary' />}
              title='Reservar Espacios'
              subtitle='Espacios comunes disponibles'
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <QuickAction
              to='/reclamos'
              icon={<ReportProblemIcon color='warning' />}
              title='Nuevo Reclamo'
              subtitle='Reportar problemas o sugerencias'
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <QuickAction
              to='/forums/general'
              icon={<ForumIcon color='action' />}
              title='Foros'
              subtitle='Participar en discusiones'
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <QuickAction
              to='/expensas'
              icon={<PaymentsIcon color='error' />}
              title='Mis Expensas'
              subtitle='Consultar mis pagos'
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper className='panel' variant='outlined' sx={{ borderRadius: 3 }}>
            <Box className='panel__head'>
              <h4>Mi Estado de Pagos</h4>
            </Box>

            <Box className='panel__content two'>
              <DonutChart data={paymentData}  size={260} />
              <ul className='legend'>
                {paymentData.map((s) => {
                  const raw = s.value
                  // limpiar si viene con '%' y convertir a número
                  const cleaned = String(raw).replace('%', '').trim()
                  const num = Number(cleaned)
                  // si es número finito, truncamos; si no, mostramos tal cual
                  const display = Number.isFinite(num) ? Math.floor(num) : raw
                  return (
                    <li key={s.label}>
                      <span className='dot' style={{ background: s.color }} />
                      {s.label}{' '}
                      <span className='muted' title={`${raw}%`}>
                        {display}%
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Box>

            <hr className='divider' />

            <Box className='pending'>
              <h5>Facturas Pendientes ({pendingBills.length})</h5>

              <div className='totals'>
                <div>
                  <span className='muted'>Total pendiente:</span>{' '}
                  <strong className='neg'>
                    <Money value={totals.totalPending} />
                  </strong>
                </div>
                <div>
                  <span className='muted'>Próximas a vencer:</span> <strong>{totals.nextToDue}</strong>
                </div>
                <div>
                  <span className='muted'>Facturas vencidas:</span>{' '}
                  <strong className='neg'>{totals.overdueCount}</strong>
                </div>
                <div>
                  <span className='muted'>Pagado este año:</span>{' '}
                  <strong className='pos'>
                    <Money value={totals.paidThisYear} />
                  </strong>
                </div>
              </div>

              <div className='history'>
                <h5>Historial de Pagos – Últimos 5 Meses</h5>
                <BarsChart data={paymentsHistory} />
              </div>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper className='panel' variant='outlined' sx={{ borderRadius: 3 }}>
            <Box className='panel__head'>
              <h4>Desglose de Gastos del Consorcio</h4>
            </Box>

            <div className='panel__content two'>
              <DonutChart
                data={(expenseBreakdown.length
                  ? expenseBreakdown
                  : [{ label: 'Sin datos', value: 100, color: '#e5e7eb' }]
                ).map((s) => ({ ...s, color: s.color ?? '#aaaaaaff' }))}
              />
              <ul className='legend'>
                {(expenseBreakdown.length
                  ? expenseBreakdown
                  : [{ label: 'Sin datos', value: 100, color: '#e5e7eb' }]
                ).map((s) => {
                  const raw = s.value
                  const num = Number(raw)
                  const intValue = Number.isFinite(num) ? Math.floor(num) : raw
                  return (
                    <li key={s.label}>
                      <span className='dot' style={{ background: s.color ?? '#aaaaaaff' }} />
                      {s.label}{' '}
                      <span className='muted' title={`${raw}%`}>
                        {intValue}%
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
