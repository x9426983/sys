<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        添加产线
      </el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column label="产线ID" prop="lineId" align="center" width="80"></el-table-column>
      <el-table-column label="产线负责人" prop="lineManager" min-width="120px"></el-table-column>
      <el-table-column label="订单列表" min-width="150px">
        <template slot-scope="{ row }">
          <div v-if="row.orders && row.orders.length > 0">
            <div v-for="(order, index) in row.orders" :key="index" class="order-item">
              <p><strong>订单ID:</strong> {{ order.orderId }}</p>
              <p><strong>产品名称:</strong> {{ order.productName }}</p>
              <p><strong>截止时间:</strong> {{ formatDate(order.deadline) }}</p>
              <el-divider v-if="index < row.orders.length - 1"></el-divider>
            </div>
          </div>
          <span v-else>无订单信息</span>
        </template>
      </el-table-column>
      <el-table-column label="设备列表" min-width="200px">
        <template slot-scope="{ row }">
          <div v-if="row.equipments && row.equipments.length > 0">
            <div v-for="(equipment, index) in row.equipments" :key="index" class="equipment-item">
              <p><strong>设备ID:</strong> {{ equipment.equipmentId }}</p>
              <p><strong>设备名称:</strong> {{ equipment.equipmentName }}</p>
              <p><strong>设备数量:</strong> {{ equipment.quantity }}</p>
              <el-divider v-if="index < row.equipments.length - 1"></el-divider>
            </div>
          </div>
          <span v-else>无设备信息</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="{ row }">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
          <el-button type="success" size="mini" @click="handleSchedule(row)" :disabled="!canSchedule(row)">
            调度计算
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑产线对话框 -->
    <el-dialog :title="dialogStatus === 'create' ? '添加产线' : '编辑产线'" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="100px">
        <el-form-item label="产线ID" prop="lineId">
          <el-input v-model.number="temp.lineId" type="number" :disabled="dialogStatus === 'update'"></el-input>
        </el-form-item>
        <el-form-item label="负责人" prop="lineManager">
          <el-input v-model="temp.lineManager"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">确认</el-button>
      </div>
    </el-dialog>

    <!-- 调度计算结果对话框 -->
    <el-dialog title="调度计算结果" :visible.sync="scheduleResultDialogVisible" width="80%" top="5vh">
      <div v-loading="scheduleLoading">
        <div v-if="scheduleResult && scheduleResult.chains && scheduleResult.chains.length > 0">
          <h3>任务链调度结果</h3>
          <el-collapse v-model="activeChains">
            <el-collapse-item v-for="(chain, index) in scheduleResult.chains" :key="index" :title="`链 ${index + 1}`" :name="index">
              <div class="chain-detail">
                <el-card class="chain-card">
                  {{ formatChain(chain) }}
                </el-card>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        <div v-else-if="scheduleResult && Object.keys(scheduleResult).length > 0">
          <el-alert
            title="调度结果格式不符合预期"
            type="warning"
            description="系统返回了调度结果，但格式不符合预期。原始结果如下："
            :closable="false"
            show-icon
          >
          </el-alert>
          <pre class="json-display">{{ JSON.stringify(scheduleResult, null, 2) }}</pre>
        </div>
        <div v-else>
          <el-empty description="没有调度计算结果"></el-empty>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="exportScheduleResult" :disabled="!hasScheduleResult">导出结果</el-button>
        <el-button @click="scheduleResultDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchProductionLines, createProductionLine, updateProductionLine, deleteProductionLine } from "@/api/line";
import { calculateSchedule } from "@/api/schedule";

export default {
  name: "LineManagement",
  data() {
    return {
      tableKey: 0,
      list: [],
      listLoading: true,
      dialogFormVisible: false,
      dialogStatus: '',
      temp: {
        lineId: undefined,
        lineManager: ''
      },
      rules: {
        lineId: [{ required: true, message: '产线ID不能为空', trigger: 'blur' },
                { type: 'number', message: '产线ID必须为数字', trigger: 'blur' }],
        lineManager: [{ required: true, message: '负责人不能为空', trigger: 'blur' }]
      },
      scheduleResultDialogVisible: false,
      scheduleLoading: false,
      scheduleResult: null,
      activeChains: [0] // 默认展开第一个链
    };
  },
  computed: {
    hasScheduleResult() {
      return this.scheduleResult && 
             ((this.scheduleResult.chains && this.scheduleResult.chains.length > 0) || 
              Object.keys(this.scheduleResult).length > 0);
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.listLoading = true;
      fetchProductionLines()
        .then(response => {
          this.list = response.data;
          this.listLoading = false;
        })
        .catch(error => {
          console.error("获取产线列表失败:", error);
          this.listLoading = false;
          this.$message.error("获取产线列表失败");
        });
    },
    resetTemp() {
      this.temp = {
        lineId: undefined,
        lineManager: ''
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = 'create';
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate();
      });
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createProductionLine(this.temp).then(() => {
            this.fetchData();
            this.dialogFormVisible = false;
            this.$message.success('创建成功');
          }).catch(error => {
            this.$message.error(error.message || '创建失败');
          });
        }
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row);
      this.dialogStatus = 'update';
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate();
      });
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          updateProductionLine(tempData).then(() => {
            this.fetchData();
            this.dialogFormVisible = false;
            this.$message.success('更新成功');
          }).catch(error => {
            this.$message.error(error.message || '更新失败');
          });
        }
      });
    },
    handleDelete(row) {
      this.$confirm(`确认删除产线 ID: ${row.lineId}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteProductionLine(row.lineId).then(() => {
          this.fetchData();
          this.$message.success('删除成功');
        }).catch(error => {
          this.$message.error(error.message || '删除失败');
        });
      }).catch(() => {});
    },
    handleSchedule(row) {
      if (!this.canSchedule(row)) {
        this.$message.warning("该产线没有足够的订单或设备信息进行调度计算");
        return;
      }
      
      this.scheduleResultDialogVisible = true;
      this.scheduleLoading = true;
      this.scheduleResult = null;
      
      calculateSchedule(row.lineId)
        .then(response => {
          this.scheduleResult = response.data;
          this.$message.success("调度计算完成");
        })
        .catch(error => {
          console.error("调度计算失败:", error);
          this.$message.error(error.message || "调度计算失败");
        })
        .finally(() => {
          this.scheduleLoading = false;
        });
    },
    formatChain(chain) {
      if (typeof chain !== 'string') return JSON.stringify(chain);
      
      const taskPattern = /([^【]+)【(\d+(?:\.\d+)?)、(\d+(?:\.\d+)?)】使用设备([^、]+)/g;
      
      let formattedChain = chain.replace(/第(\d+)条链：/, '');
      let tasks = [];
      let match;
      
      while ((match = taskPattern.exec(formattedChain)) !== null) {
        tasks.push({
          taskId: match[1].trim(),
          startTime: parseFloat(match[2]),
          endTime: parseFloat(match[3]),
          equipment: match[4].trim()
        });
      }
      
      if (tasks.length === 0) return chain;
      
      const formattedTasks = tasks.map((task, idx) => {
        return `任务 ${idx + 1}: ${task.taskId}
  开始时间: ${task.startTime}
  结束时间: ${task.endTime}
  使用设备: ${task.equipment}
  持续时间: ${(task.endTime - task.startTime).toFixed(2)}`;
      });
      
      return formattedTasks.join('\n\n');
    },
    canSchedule(row) {
      return row.orders && row.orders.length > 0 && row.equipments && row.equipments.length > 0;
    },
    formatDate(date) {
      if (!date) return '无截止日期';
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    exportScheduleResult() {
      if (!this.hasScheduleResult) return;
      
      let exportText = '';
      
      if (this.scheduleResult.chains && this.scheduleResult.chains.length > 0) {
        exportText = this.scheduleResult.chains.map((chain, index) => {
          return `==== 链 ${index + 1} ====\n${this.formatChain(chain)}`;
        }).join('\n\n');
      } else {
        exportText = JSON.stringify(this.scheduleResult, null, 2);
      }
      
      const blob = new Blob([exportText], { type: 'text/plain' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `调度结果_${new Date().toISOString().slice(0, 10)}.txt`;
      link.click();
      
      URL.revokeObjectURL(link.href);
    }
  }
};
</script>

<style scoped>
.filter-container {
  padding-bottom: 10px;
}
.equipment-item, .order-item {
  padding: 8px 0;
}
.equipment-item p, .order-item p {
  margin: 4px 0;
}
.chain-detail {
  padding: 10px 0;
}
.chain-card {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
}
.json-display {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
  margin-top: 15px;
}
</style>