// React Query hooks for file system data

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MergedContent, FileInfo, EnvCheckResult, AppSettings } from '../../shared/types';

// File reading
export function useReadFile(path: string | null) {
  return useQuery({
    queryKey: ['file', path],
    queryFn: () => window.electronAPI.fs.readFile(path!),
    enabled: !!path,
  });
}

// Three-level read
export function useRead3L(relativePath: string, projectSlug?: string) {
  return useQuery({
    queryKey: ['3l', relativePath, projectSlug],
    queryFn: () => window.electronAPI.fs.read3L(relativePath, projectSlug),
  });
}

// Directory listing
export function useListDir(path: string | null) {
  return useQuery({
    queryKey: ['dir', path],
    queryFn: () => window.electronAPI.fs.listDir(path!),
    enabled: !!path,
  });
}

// File existence check
export function useFileExists(path: string | null) {
  return useQuery({
    queryKey: ['exists', path],
    queryFn: () => window.electronAPI.fs.exists(path!),
    enabled: !!path,
  });
}

// Environment check
export function useEnvCheck() {
  return useQuery({
    queryKey: ['envCheck'],
    queryFn: () => window.electronAPI.env.check(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Settings
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => window.electronAPI.settings.getAll(),
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: keyof AppSettings; value: unknown }) =>
      window.electronAPI.settings.set(key, value as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

// App info
export function useAppInfo() {
  return useQuery({
    queryKey: ['appInfo'],
    queryFn: () => window.electronAPI.app.getInfo(),
    staleTime: Infinity,
  });
}

// Project path
export function useProjectPath() {
  return useQuery({
    queryKey: ['projectPath'],
    queryFn: () => window.electronAPI.app.getProjectPath(),
    staleTime: Infinity,
  });
}

// Monitor status
export function useMonitorStatus() {
  return useQuery({
    queryKey: ['monitorStatus'],
    queryFn: () => window.electronAPI.monitor.getStatus(),
    refetchInterval: 30_000, // Poll every 30s
  });
}

// Write file mutation
export function useWriteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ path, content }: { path: string; content: string }) =>
      window.electronAPI.fs.writeFile(path, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['file', variables.path] });
    },
  });
}

// Write to user level
export function useWriteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ relativePath, content }: { relativePath: string; content: string }) =>
      window.electronAPI.fs.writeUser(relativePath, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['3l'] });
    },
  });
}
