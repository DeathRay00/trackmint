-- =================================================================
-- Trackmint Manufacturing Management System Database Schema
-- Version 2.0 - Revised and Corrected
-- =================================================================

-- Create database (run this manually if needed)
-- CREATE DATABASE trackmint_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- 1. Lookup Tables (Normalization)
-- =================================================================

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Manufacturing & Work Order Statuses Table
CREATE TABLE IF NOT EXISTS order_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Priority Levels Table
CREATE TABLE IF NOT EXISTS priority_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stock Move Types Table
CREATE TABLE IF NOT EXISTS stock_move_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Locations Table (for Inventory)
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    parent_location_id UUID REFERENCES locations(id) ON UPDATE CASCADE ON DELETE SET NULL, -- For hierarchical locations (e.g., Warehouse > Zone > Bin)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- 2. Core Tables
-- =================================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id UUID NOT NULL REFERENCES user_roles(id) ON UPDATE CASCADE,
    avatar VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- For soft deletes
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_of_measure VARCHAR(50) NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Work Centers Table
CREATE TABLE IF NOT EXISTS work_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    capacity DECIMAL(5, 2) NOT NULL, -- hours per day
    cost_per_hour DECIMAL(10, 2) NOT NULL,
    efficiency DECIMAL(5, 2) NOT NULL DEFAULT 100, -- percentage
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- BOMs (Bill of Materials) Table
CREATE TABLE IF NOT EXISTS boms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON UPDATE CASCADE,
    version VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(product_id, version)
);

-- BOM Components Table
CREATE TABLE IF NOT EXISTS bom_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bom_id UUID NOT NULL REFERENCES boms(id) ON UPDATE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON UPDATE CASCADE,
    quantity DECIMAL(10, 3) NOT NULL,
    -- unit_cost is captured here to snapshot the component cost at the time the BOM was created.
    unit_cost DECIMAL(10, 2) NOT NULL,
    created_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- BOM Operations Table
CREATE TABLE IF NOT EXISTS bom_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bom_id UUID NOT NULL REFERENCES boms(id) ON UPDATE CASCADE,
    work_center_id UUID NOT NULL REFERENCES work_centers(id) ON UPDATE CASCADE,
    sequence INTEGER NOT NULL,
    description TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    setup_time INTEGER NOT NULL DEFAULT 0, -- in minutes
    cost_per_hour DECIMAL(10, 2) NOT NULL,
    created_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Manufacturing Orders Table
CREATE TABLE IF NOT EXISTS manufacturing_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON UPDATE CASCADE,
    bom_id UUID NOT NULL REFERENCES boms(id) ON UPDATE CASCADE,
    quantity INTEGER NOT NULL,
    status_id UUID NOT NULL REFERENCES order_statuses(id) ON UPDATE CASCADE,
    priority_id UUID NOT NULL REFERENCES priority_levels(id) ON UPDATE CASCADE,
    planned_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    planned_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_date TIMESTAMP WITH TIME ZONE,
    actual_end_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Work Orders Table
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_number VARCHAR(100) UNIQUE NOT NULL,
    manufacturing_order_id UUID NOT NULL REFERENCES manufacturing_orders(id) ON UPDATE CASCADE,
    bom_operation_id UUID NOT NULL REFERENCES bom_operations(id) ON UPDATE CASCADE,
    status_id UUID NOT NULL REFERENCES order_statuses(id) ON UPDATE CASCADE,
    assigned_operator_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    planned_duration INTEGER NOT NULL, -- in minutes
    actual_duration INTEGER, -- in minutes
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    issues TEXT,
    created_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Stock Moves Table
CREATE TABLE IF NOT EXISTS stock_moves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON UPDATE CASCADE,
    move_type_id UUID NOT NULL REFERENCES stock_move_types(id) ON UPDATE CASCADE,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    reference_id UUID, -- Generic reference to MO or WO ID
    reference_type VARCHAR(10) CHECK (reference_type IN ('MO', 'WO')),
    location_id UUID NOT NULL REFERENCES locations(id) ON UPDATE CASCADE,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Note: Stock moves are often immutable; this is for correction purposes.
    deleted_at TIMESTAMP WITH TIME ZONE
);


-- =================================================================
-- 3. Indexes for Performance
-- =================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_manufacturing_orders_status ON manufacturing_orders(status_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status_id);
CREATE INDEX IF NOT EXISTS idx_stock_moves_product_id ON stock_moves(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_moves_created_at ON stock_moves(created_at);
-- Index for soft deletes to improve query performance
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);
CREATE INDEX IF NOT EXISTS idx_manufacturing_orders_deleted_at ON manufacturing_orders(deleted_at);


-- =================================================================
-- 4. Triggers for Automatic Timestamps
-- =================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables that have an updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_centers_updated_at BEFORE UPDATE ON work_centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boms_updated_at BEFORE UPDATE ON boms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bom_components_updated_at BEFORE UPDATE ON bom_components FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bom_operations_updated_at BEFORE UPDATE ON bom_operations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_manufacturing_orders_updated_at BEFORE UPDATE ON manufacturing_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_moves_updated_at BEFORE UPDATE ON stock_moves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =================================================================
-- 5. Initial Data Population for Lookup Tables
-- =================================================================

INSERT INTO user_roles (name, description) VALUES
    ('Admin', 'System administrator with full access.'),
    ('ManufacturingManager', 'Manages manufacturing orders and production schedules.'),
    ('Operator', 'Operates machinery and executes work orders.'),
    ('InventoryManager', 'Manages stock levels, products, and inventory moves.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO order_statuses (name, description) VALUES
    ('Planned', 'The order is planned but not yet started.'),
    ('In Progress', 'The order is currently being worked on.'),
    ('Done', 'The order has been completed successfully.'),
    ('Canceled', 'The order has been canceled.'),
    ('Ready', 'The work order is ready to be started.'),
    ('Started', 'The work order has been started.'),
    ('Paused', 'The work order is temporarily paused.'),
    ('Completed', 'The work order has been completed.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO priority_levels (name, description) VALUES
    ('Low', 'Low priority.'),
    ('Medium', 'Medium priority.'),
    ('High', 'High priority.'),
    ('Critical', 'Critical priority, must be addressed immediately.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO stock_move_types (name, description) VALUES
    ('In', 'Stock coming into inventory.'),
    ('Out', 'Stock leaving inventory.'),
    ('Transfer', 'Stock moving between internal locations.'),
    ('Adjustment', 'A manual correction of stock levels.')
ON CONFLICT (name) DO NOTHING;