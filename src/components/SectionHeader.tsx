import type { GridSize } from '@mui/material'
import { Box, Grid, Paper, Stack, Tab, Tabs, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import React from 'react'

export interface StatItem {
  icon: React.ReactNode
  title: string
  value: number | string
  color?: 'primary' | 'success' | 'secondary' | 'warning' | 'info' | 'error'
  onClick?: () => void // 👈 NUEVO: función de click opcional
  href?: string // 👈 NUEVO: link opcional (alternativa a onClick)
}

export interface TabItem {
  label: string
  value: string
}

interface PageHeaderProps {
  title: string
  stats?: StatItem[]
  showSearch?: boolean
  searchPlaceholder?: string
  onSearchChange?: (query: string) => void
  tabs?: TabItem[]
  selectedTab?: string
  onTabChange?: (value: string) => void
  actions?: React.ReactNode
  filters?: React.ReactNode[]
  sx?: object
}

export default function PageHeader({
  title,
  stats = [],
  showSearch = false,
  searchPlaceholder = 'Buscar...',
  onSearchChange,
  tabs = [],
  selectedTab,
  onTabChange,
  actions,
  filters = [],
  sx = {}
}: PageHeaderProps) {
  if (!stats) stats = []

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // lógica para que 4 por fila cuando haya >=4, pero si hay 2 -> md=6 (50% cada uno)
  const maxCols = 4
  const colsActuales = Math.min(maxCols, Math.max(1, stats.length))
  const mdSize = Math.floor(12 / colsActuales) as GridSize

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        bgcolor: 'background.paper',
        borderColor: 'divider',
        ...sx
      }}
    >
      {/* Título + acción */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent='space-between'
        sx={{ mb: 2, gap: { xs: 1.5, md: 0 } }}
      >
        <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600} color='primary'>
          {title}
        </Typography>

        {actions && (
          <Box
            sx={{
              alignSelf: { xs: 'stretch', md: 'center' },
              display: 'flex',
              justifyContent: { xs: 'flex-start', md: 'flex-end' }
            }}
          >
            {actions}
          </Box>
        )}
      </Stack>

      {/* Métricas (sólo si hay items) */}
      {stats.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 2 }} justifyContent='center'>
          {stats.map((s, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: mdSize }} sx={{ width: '100%' }}>
              <Paper
                elevation={0}
                variant='outlined'
                component={s.href ? 'a' : 'div'} // 👈 NUEVO: usa <a> si hay href
                href={s.href} // 👈 NUEVO
                onClick={s.onClick} // 👈 NUEVO
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  textDecoration: 'none', // 👈 NUEVO: quitar subrayado si es link
                  cursor: s.onClick || s.href ? 'pointer' : 'default', // 👈 NUEVO
                  transition: 'all 0.2s ease-in-out', // 👈 NUEVO
                  '&:hover':
                    s.onClick || s.href
                      ? {
                          // 👈 NUEVO: efecto hover
                          boxShadow: 2,
                          transform: 'translateY(-2px)'
                        }
                      : {}
                }}
              >
                <Box
                  sx={(t) => ({
                    width: 36,
                    height: 36,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(t.palette[s.color || 'primary'].main, 0.15),
                    color: t.palette[s.color || 'primary'].main
                  })}
                >
                  {s.icon}
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    {s.title}
                  </Typography>
                  <Typography variant='h6'>{s.value}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Buscador + filtros opcionales */}
      {(showSearch || filters.length > 0) && (
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{ mb: 2 }}
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          {showSearch && (
            <TextField
              fullWidth
              size='small'
              placeholder={searchPlaceholder}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className='foraria-form-input'
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  '& fieldset': { borderColor: 'divider' }
                }
              }}
            />
          )}
          {filters.map((f, i) => (
            <Box key={i}>{f}</Box>
          ))}
        </Stack>
      )}

      {/* Tabs / filtros de foro */}
      {tabs.length > 0 && (
        <Box
          sx={{
            mt: 1,
            overflowX: 'auto'
          }}
        >
          <Tabs
            value={selectedTab ?? tabs[0]?.value}
            onChange={(_, v) => onTabChange?.(v)}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 999,
                minHeight: 40,
                px: 2.5,
                mr: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.secondary',
                whiteSpace: 'nowrap'
              },
              '& .MuiTab-root.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderColor: 'primary.main',
                boxShadow: '0 6px 14px rgba(8,61,119,0.25)'
              },
              '& .MuiTabs-indicator': { display: 'none' }
            }}
          >
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
        </Box>
      )}
    </Paper>
  )
}
