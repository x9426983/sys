<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <div class="filter-container">
      <el-input
        v-model="searchForm.orderId"
        placeholder="订单ID"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        添加订单
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="订单ID" prop="orderId" align="center" width="100" />
      <el-table-column label="产品列表" align="center">
        <template slot-scope="{row}">
          <div v-for="(product, index) in row.products" :key="index">
            <p>产品ID: {{ product.productId }}</p>
            <p>产品名称: {{ product.productName }}</p>
            <p>数量: {{ product.quantity }}</p>
            <el-divider v-if="index < row.products.length - 1" />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pagesize"
      @pagination="getList"
    />

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="dialogStatus === 'create' ? '添加订单' : '编辑订单'" :visible.sync="dialogVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
      >
        <el-form-item label="订单ID" prop="orderId">
          <el-input v-model="temp.orderId" />
        </el-form-item>
        <el-form-item label="产品信息">
          <div v-for="(product, index) in temp.products" :key="index" class="product-item">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item :label="'产品ID'" :prop="`products.${index}.productId`">
                  <el-input v-model="product.productId" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="'产品名称'" :prop="`products.${index}.productName`">
                  <el-input v-model="product.productName" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item :label="'数量'" :prop="`products.${index}.quantity`">
                  <el-input-number v-model="product.quantity" :min="1" />
                </el-form-item>
              </el-col>
              <el-col :span="2">
                <el-button type="danger" icon="el-icon-delete" circle @click.prevent="removeProduct(index)" />
              </el-col>
            </el-row>
          </div>
          <el-button type="primary" @click="addProduct">添加产品</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getOrderList, getOrderDetail, addOrder, updateOrder, deleteOrder } from '@/api/order'
import Pagination from '@/components/Pagination'

export default {
  name: 'Order',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        pagesize: 10,
        orderId: undefined
      },
      searchForm: {
        orderId: ''
      },
      temp: {
        orderId: '',
        products: []
      },
      dialogVisible: false,
      dialogStatus: '',
      rules: {
        orderId: [{ required: true, message: '订单ID不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      try {
        const { data } = await getOrderList(this.listQuery)
        this.list = data.items
        this.total = data.total
      } catch (error) {
        console.error('获取订单列表失败:', error)
      }
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 1
      this.listQuery.orderId = this.searchForm.orderId
      this.getList()
    },
    resetTemp() {
      this.temp = {
        orderId: '',
        products: []
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async createData() {
      this.$refs['dataForm'].validate(async (valid) => {
        if (valid) {
          try {
            await addOrder(this.temp)
            this.dialogVisible = false
            this.$message({
              type: 'success',
              message: '创建成功'
            })
            this.getList()
          } catch (error) {
            console.error('创建订单失败:', error)
          }
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async updateData() {
      this.$refs['dataForm'].validate(async (valid) => {
        if (valid) {
          try {
            await updateOrder(this.temp)
            this.dialogVisible = false
            this.$message({
              type: 'success',
              message: '更新成功'
            })
            this.getList()
          } catch (error) {
            console.error('更新订单失败:', error)
          }
        }
      })
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该订单吗？')
        await deleteOrder(row.orderId)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getList()
      } catch (error) {
        console.error('删除订单失败:', error)
      }
    },
    addProduct() {
      this.temp.products.push({
        productId: '',
        productName: '',
        quantity: 1
      })
    },
    removeProduct(index) {
      this.temp.products.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 10px;
}
.filter-item {
  margin-right: 10px;
}
.product-item {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
}
</style>