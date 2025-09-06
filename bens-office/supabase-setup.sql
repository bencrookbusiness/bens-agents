-- Ben's Office - Supabase Database Setup
-- Run this in your Supabase SQL Editor to create the necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create offices table
CREATE TABLE IF NOT EXISTS offices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  position_x INTEGER,
  position_y INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger types enum
CREATE TYPE trigger_type AS ENUM ('click', 'chat', 'upload', 'automatic', 'none');
CREATE TYPE return_type AS ENUM ('none', 'text', 'chat');

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type trigger_type NOT NULL DEFAULT 'click',
  return_type return_type NOT NULL DEFAULT 'text',
  webhook_url TEXT NOT NULL,
  workflow_url TEXT,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Create policies for offices
CREATE POLICY "Users can view their own offices" ON offices
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create offices" ON offices
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own offices" ON offices
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own offices" ON offices
  FOR DELETE USING (auth.uid() = owner_id);

-- Create policies for departments
CREATE POLICY "Users can view departments in their offices" ON departments
  FOR SELECT USING (
    office_id IN (
      SELECT id FROM offices WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create departments in their offices" ON departments
  FOR INSERT WITH CHECK (
    office_id IN (
      SELECT id FROM offices WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update departments in their offices" ON departments
  FOR UPDATE USING (
    office_id IN (
      SELECT id FROM offices WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete departments in their offices" ON departments
  FOR DELETE USING (
    office_id IN (
      SELECT id FROM offices WHERE owner_id = auth.uid()
    )
  );

-- Create policies for agents
CREATE POLICY "Users can view agents in their departments" ON agents
  FOR SELECT USING (
    department_id IN (
      SELECT d.id FROM departments d
      JOIN offices o ON d.office_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create agents in their departments" ON agents
  FOR INSERT WITH CHECK (
    department_id IN (
      SELECT d.id FROM departments d
      JOIN offices o ON d.office_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update agents in their departments" ON agents
  FOR UPDATE USING (
    department_id IN (
      SELECT d.id FROM departments d
      JOIN offices o ON d.office_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete agents in their departments" ON agents
  FOR DELETE USING (
    department_id IN (
      SELECT d.id FROM departments d
      JOIN offices o ON d.office_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  );

-- Create functions to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_offices_updated_at
  BEFORE UPDATE ON offices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();