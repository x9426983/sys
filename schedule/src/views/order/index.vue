<template>
  <div class="container">
    <div class="app-container">
      <el-row>
        <el-col :span="24">
          <!-- 搜索表单 -->
          <el-form :inline="true">
            <el-form-item label="订单ID">
              <el-input v-model="pageParams.orderId" placeholder="订单ID" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="changeValue">查询</el-button>
              <el-button type="info" @click="clear">清空</el-button>
              <el-button type="primary" style="margin-right:20px" @click="showDialog = true">+ 新增订单</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <br>

      <el-table :data="list" border row-key="rowId">
        <el-table-column align="center" prop="orderId" label="订单ID" width="120">
          <template v-slot=" {row} ">
            <span>{{ row.orderId }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" prop="proId" label="产品ID" width="120">
          <template v-slot=" {row} ">
            <span>{{ row.proId }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" prop="proName" label="产品名称" width="120">
          <template v-slot=" {row} ">
            <span>{{ row.proName }}</span>
          </template>
        </el-table-column> 
        
        <el-table-column align="center" prop="proNumber" label="产品数量" width="120">
          <template v-slot=" {row} ">
            <span>{{ row.proNumber }}</span>
          </template>
        </el-table-column> 

        <el-table-column align="center" prop="orderManager" label="订单负责人" width="120">
          <template v-slot=" {row} ">
            <span>{{ row.orderManager }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" prop="orderTime" label="交付时间">
          <template v-slot=" {row} ">
            <span>{{ row.orderTime }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作">
          <template v-slot="{ row }">
            <el-button type="primary" size="mini" @click="btnEdit(row)">编辑</el-button>
            <el-popconfirm
              title="确定删除吗"
              @onConfirm="confirmDel(row.orderId, row.proId)">
              <el-button slot="reference" style="margin-left:10px" type="danger" size="mini">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-row type="flex" style="height:60px" align="middle" justify="end">
        <el-pagination
          :page-size="pageParams.pagesize"
          :current-page="pageParams.page"
          :total="pageParams.total"
          layout="prev, pager, next"
          @current-change="changePage"
        />
      </el-row>

    </div>
    
    <!-- 新增订单对话框 -->
    <el-dialog title="新增订单" :visible.sync="showDialog" width="700px" @close="btnCancel">
      <el-form ref="orderForm" :model="orderForm" :rules="rules" label-width="120px">
        <el-form-item prop="orderId" label="订单ID">
          <el-input v-model="orderForm.orderId" style="width:300px" size="mini" />
        </el-form-item>

        <el-form-item prop="orderManager" label="订单负责人">
          <el-input v-model="orderForm.orderManager" style="width:300px" size="mini" />
        </el-form-item>
        
        <el-form-item prop="orderTime" label="交付时间">
          <el-date-picker v-model="orderForm.orderTime" type="date" placeholder="选择日期" style="width:300px" />
        </el-form-item>
        
        <el-divider content-position="left">产品信息</el-divider>
        
        <div v-for="(product, index) in orderForm.products" :key="index" class="product-item">
          <el-row :gutter="20">
            <el-col :span="10">
              <el-form-item 
                :label="'产品' + (index + 1)" 
                :prop="'products.' + index + '.proId'" 
                :rules="productRules.proId">
                <el-input v-model="product.proId" placeholder="产品ID" size="mini" />
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item 
                :prop="'products.' + index + '.proNumber'"
                :rules="productRules.proNumber">
                <el-input v-model="product.proNumber" placeholder="产品数量" size="mini" />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-button 
                v-if="index > 0" 
                type="danger" 
                icon="el-icon-delete" 
                size="mini" 
                circle 
                @click.prevent="removeProduct(index)">
              </el-button>
            </el-col>
          </el-row>
        </div>
        
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="addProduct">添加产品</el-button>
        </el-form-item>

        <el-form-item>
          <el-row type="flex" justify="center">
            <el-col :span="18">
              <el-button type="primary" @click="btnOK">提交</el-button>
              <el-button @click="btnCancel">取消</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 编辑订单对话框 -->
    <el-dialog title="编辑订单" :visible.sync="showUpdateDialog" width="700px" @close="btnCancel">
      <el-form ref="orderUpdateForm" :model="orderUpdateForm" :rules="rules" label-width="120px">
        <el-form-item prop="orderId" label="订单ID">
          <el-input v-model="orderUpdateForm.orderId" style="width:300px" size="mini" :disabled="true"/>
        </el-form-item>
        
        <el-form-item prop="orderManager" label="订单负责人">
          <el-input v-model="orderUpdateForm.orderManager" style="width:300px" size="mini" />
        </el-form-item>
        
        <el-form-item prop="orderTime" label="交付时间">
          <el-date-picker v-model="orderUpdateForm.orderTime" type="date" placeholder="选择日期" style="width:300px" />
        </el-form-item>
        
        <el-divider content-position="left">当前产品信息</el-divider>
        
        <el-form-item prop="proId" label="产品ID">
          <el-input v-model="orderUpdateForm.proId" style="width:300px" size="mini" :disabled="true"/>
        </el-form-item>

        <el-form-item prop="proName" label="产品名称">
          <el-input v-model="orderUpdateForm.proName" style="width:300px" size="mini" :disabled="true"/>
        </el-form-item>
        
        <el-form-item prop="proNumber" label="产品数量">
          <el-input v-model="orderUpdateForm.proNumber" style="width:300px" size="mini" />
        </el-form-item>
        
        <el-form-item>
          <el-row type="flex" justify="center">
            <el-col :span="18">
              <el-button type="primary" @click="updatebtnOK">确定</el-button>
              <el-button @click="updatebtnCancel">取消</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
import { getOrderList, addOrder, updateOrder, deleteOrder, getOrderDetail } from '@/api/order'
export default {
  name: 'Order',
  data() {
    return {
      list: [],
      showDialog: false,
      showUpdateDialog: false,
      // 将分页信息放置到一个对象中
      pageParams: {
        page: 1,
        pagesize: 10,
        total: 0,
        orderId: ''
      },
      orderForm: {
        orderId: '',
        orderTime: '',
        orderManager: '',
        products: [{ proId: '', proNumber: '' }]
      },
      orderUpdateForm: {
        orderId: '',
        proId: '',
        orderTime: '',
        proNumber: '',
        orderManager: '',
        proName: null
      },
      rules: {
        orderId: [{ required: true, message: '订单ID不能为空', trigger: 'blur' }],
        orderTime: [{ required: true, message: '交付时间不能为空', trigger: 'blur' }],
        orderManager: [{ required: true, message: '订单负责人不能为空', trigger: 'blur' }],
        proNumber: [{ required: true, message: '产品数量不能为空', trigger: 'blur' }]
      },
      productRules: {
        proId: [{ required: true, message: '产品ID不能为空', trigger: 'blur' }],
        proNumber: [{ required: true, message: '产品数量不能为空', trigger: 'blur' }]
      }
    };
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 添加产品输入行
    addProduct() {
      this.orderForm.products.push({ 
        proId: '', 
        proNumber: '' 
      });
    },
    
    // 删除产品输入行
    removeProduct(index) {
      this.orderForm.products.splice(index, 1);
    },
    
    async btnEdit(row) {
      // 当点击编辑按钮时执行
      this.orderUpdateForm.orderId = row.orderId;
      this.orderUpdateForm.proId = row.proId;
      this.orderUpdateForm.proName = row.proName;
      this.orderUpdateForm.proNumber = row.proNumber;
      this.orderUpdateForm.orderManager = row.orderManager;
      this.orderUpdateForm.orderTime = row.orderTime;
      this.showUpdateDialog = true; // 显示编辑对话框
    },
    
    async confirmDel(orderId, proId) {
      await deleteOrder(orderId, proId)
      this.$message.success('删除成功')
      if (this.list.length === 1) this.pageParams.page--
      this.getOrderList()
    },
    
    updatebtnOK() {
      this.$refs.orderUpdateForm.validate(isOK => {
        if (isOK) {
          updateOrder(this.orderUpdateForm)
          this.$message.success('更新订单成功')
          this.getOrderList()
          this.showUpdateDialog = false
        }
      });
    },
    
    updatebtnCancel() {
      // 取消编辑
      this.showUpdateDialog = false; // 隐藏对话框
    },
    
    async getOrderList() {
      const { data } = await getOrderList(this.pageParams)
      const { rows, total } = data
      
      // 给每一行添加唯一标识符用于表格的 row-key
      this.list = rows.map((item, index) => {
        return {
          ...item,
          rowId: `${item.orderId}_${item.proId}_${index}`
        };
      });
      
      this.pageParams.total = total
    },
    
    // 切换分页时 请求新的数据
    changePage(newPage) {
      this.pageParams.page = newPage
      this.getOrderList()
    },
    
    btnOK() {
      this.$refs.orderForm.validate(async isOK => {
        if (isOK) {
          // 检查是否所有产品信息都已填写完整
          if (this.orderForm.products.length === 0) {
            this.$message.warning('请至少添加一个产品');
            return;
          }
          
          // 依次添加每个产品
          for (const product of this.orderForm.products) {
            if (!product.proId || !product.proNumber) {
              this.$message.warning('请确保所有产品信息填写完整');
              return;
            }
            
            const orderData = {
              orderId: this.orderForm.orderId,
              proId: product.proId,
              proNumber: product.proNumber,
              orderManager: this.orderForm.orderManager,
              orderTime: this.orderForm.orderTime
            };
            
            try {
              await addOrder(orderData);
            } catch (error) {
              this.$message.error('添加订单失败: ' + (error.message || '未知错误'));
              return;
            }
          }
          
          this.$message.success('新增订单成功');
          this.getOrderList();
          this.showDialog = false;
          this.resetOrderForm();
        }
      });
    },
    
    btnCancel() {
      this.resetOrderForm();
      this.showDialog = false;
    },
    
    resetOrderForm() {
      if (this.$refs.orderForm) {
        this.$refs.orderForm.resetFields();
      }
      this.orderForm = {
        orderId: '',
        orderTime: '',
        orderManager: '',
        products: [{ proId: '', proNumber: '' }]
      };
    },
    
    changeValue() {
      this.pageParams.page = 1
      this.getOrderList()
    },
    
    clear() {
      this.pageParams.orderId = null
      this.getOrderList()
    }
  }
}
</script>

<style scoped>
.product-item {
  margin-bottom: 10px;
  padding: 10px;
  border-bottom: 1px dashed #ebeef5;
}
</style>