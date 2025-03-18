// @/views/Line/Line.vue
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-plus"
        @click="handleCreate"
      >
        添加产线
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column
        label="产线ID"
        prop="line_id"
        align="center"
        width="80"
      >
        <template slot-scope="{row}">
          <span>{{ row.line_id }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="产线负责人"
        min-width="120px"
      >
        <template slot-scope="{row}">
          <span>{{ row.line_manager }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="订单列表"
        min-width="150px"
      >
        <template slot-scope="{row}">
          <div v-if="row.orders && row.orders.length > 0">
            <el-tag
              v-for="order in row.orders"
              :key="order.order_id"
              size="mini"
              style="margin-right: 5px; margin-bottom: 5px;"
            >
              {{ order.order_id }}
            </el-tag>
          </div>
          <span v-else>无订单</span>
        </template>
      </el-table-column>

      <el-table-column
        label="设备列表"
        min-width="200px"
      >
        <template slot-scope="{row}">
          <div v-if="row.equipment && row.equipment.length > 0">
            <el-tag
              v-for="item in row.equipment"
              :key="item.equipment_id"
              type="success"
              size="mini"
              style="margin-right: 5px; margin-bottom: 5px;"
            >
              {{ item.equipment_name }} ({{ item.quantity }}台)
            </el-tag>
          </div>
          <span v-else>无设备</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button
            type="primary"
            size="mini"
            @click="handleUpdate(row)"
          >
            编辑
          </el-button>
          <el-button
            type="success"
            size="mini"
            @click="handleSchedule(row)"
            :disabled="!canSchedule(row)"
          >
            调度计算
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-show="total>0"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :page-size.sync="listQuery.limit"
      :current-page.sync="listQuery.page"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 添加/编辑产线对话框 -->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      width="800px"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
      >
        <el-form-item
          label="产线ID"
          prop="line_id"
        >
          <el-input
            v-model="temp.line_id"
            :disabled="dialogStatus==='update'"
          />
        </el-form-item>
        <el-form-item
          label="产线负责人"
          prop="line_manager"
        >
          <el-input v-model="temp.line_manager" />
        </el-form-item>

        <!-- 选择订单 -->
        <el-form-item
          label="订单"
          prop="orders"
        >
          <el-select
            v-model="temp.selectedOrders"
            multiple
            placeholder="选择订单"
            style="width: 100%"
          >
            <el-option
              v-for="item in availableOrders"
              :key="item.order_id"
              :label="`订单 #${item.order_id} (${item.responsible_person})`"
              :value="item.order_id"
            />
          </el-select>
        </el-form-item>

        <!-- 选择设备 -->
        <el-form-item
          label="设备"
          prop="equipment"
        >
          <div v-if="temp.equipment && temp.equipment.length > 0">
            <div
              v-for="(item, index) in temp.equipment"
              :key="index"
              class="equipment-item"
            >
              <el-select
                v-model="item.equipment_id"
                placeholder="选择设备"
                style="width: 250px; margin-right: 10px;"
                @change="handleEquipmentChange(index)"
              >
                <el-option
                  v-for="eq in availableEquipment"
                  :key="eq.equipment_id"
                  :label="`${eq.equipment_name} (可用: ${getAvailableQuantity(eq, item)})`"
                  :value="eq.equipment_id"
                />
              </el-select>
              <el-input-number
                v-model="item.quantity"
                :min="1"
                :max="getMaxQuantity(item)"
                style="width: 120px; margin-right: 10px;"
              />
              <el-button
                type="danger"
                icon="el-icon-delete"
                circle
                @click="removeEquipmentItem(index)"
              />
            </div>
          </div>
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="addEquipmentItem"
          >添加设备</el-button>
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>

    <!-- 调度结果对话框 - 仅显示调度链信息 -->
    <el-dialog
      title="调度结果"
      :visible.sync="scheduleDialogVisible"
      width="80%"
      top="5vh"
    >
      <div v-loading="scheduleLoading">
        <div v-if="scheduleData">
          <!-- 调度链信息 - 增强展示 -->
          <el-card class="schedule-chains-card">
            <div
              slot="header"
              class="clearfix"
            >
              <span>调度链信息</span>
              <el-tooltip
                content="调度链展示了任务的执行顺序和时间关系"
                placement="top"
              >
                <i
                  class="el-icon-question"
                  style="margin-left: 5px;"
                ></i>
              </el-tooltip>
            </div>

            <!-- 增强的调度链表格 -->
            <el-table
              :data="scheduleData.chains"
              border
              style="width: 100%"
              row-class-name="chain-row"
            >
              <el-table-column
                prop="chainId"
                label="链编号"
                width="80"
                align="center"
              >
                <template slot-scope="scope">
                  <el-tag
                    type="primary"
                    size="medium"
                  >{{ scope.row.chainId }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="chainInfo"
                label="链信息"
              >
                <template slot-scope="scope">
                  <div class="chain-info">
                    <!-- 如果链信息包含时间标记，提取并格式化展示 -->
                    <template v-if="extractChainTimeInfo(scope.row.chainInfo)">
                      <div class="chain-tasks">
                        <span class="task-sequence">{{ extractChainTasks(scope.row.chainInfo) }}</span>
                      </div>
                      <div class="chain-time-info">
                        <el-tag
                          type="success"
                          size="mini"
                        >开始: {{ extractChainTimeInfo(scope.row.chainInfo).startTime }}</el-tag>
                        <i
                          class="el-icon-arrow-right"
                          style="margin: 0 5px;"
                        ></i>
                        <el-tag
                          type="danger"
                          size="mini"
                        >结束: {{ extractChainTimeInfo(scope.row.chainInfo).endTime }}</el-tag>
                        <el-tag
                          type="info"
                          size="mini"
                          style="margin-left: 5px;"
                        >
                          耗时: {{ calculateDuration(extractChainTimeInfo(scope.row.chainInfo)) }}
                        </el-tag>
                      </div>
                    </template>
                    <!-- 没有时间标记的简单展示 -->
                    <template v-else>
                      <div>{{ scope.row.chainInfo }}</div>
                    </template>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="100"
                align="center"
              >
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="small"
                    @click="showChainDetails(scope.row)"
                    icon="el-icon-view"
                  >
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
        <div
          v-else-if="!scheduleLoading"
          class="no-schedule-data"
        >
          暂无调度数据，请确保产线上有足够的设备和订单
        </div>
      </div>

      <!-- 链详情对话框 -->
      <el-dialog
        title="调度链详情"
        :visible.sync="chainDetailVisible"
        width="50%"
        append-to-body
        v-if="selectedChain"
      >
        <div class="chain-detail-content">
          <div class="chain-header">
            <h3>链 #{{ selectedChain.chainId }}</h3>
            <p>{{ extractChainTasks(selectedChain.chainInfo) }}</p>
          </div>

          <el-divider content-position="left">时间信息</el-divider>

          <div
            class="time-info"
            v-if="extractChainTimeInfo(selectedChain.chainInfo)"
          >
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="detail-item">
                  <span class="detail-label">开始时间:</span>
                  <span class="detail-value">{{ extractChainTimeInfo(selectedChain.chainInfo).startTime }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="detail-item">
                  <span class="detail-label">结束时间:</span>
                  <span class="detail-value">{{ extractChainTimeInfo(selectedChain.chainInfo).endTime }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="detail-item">
                  <span class="detail-label">总耗时:</span>
                  <span class="detail-value">{{ calculateDuration(extractChainTimeInfo(selectedChain.chainInfo)) }}</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <el-divider content-position="left">任务列表</el-divider>

          <el-table
            :data="extractTaskDetails(selectedChain)"
            border
          >
            <el-table-column
              prop="taskId"
              label="任务ID"
            ></el-table-column>
            <el-table-column
              prop="sequence"
              label="顺序"
              width="80"
              align="center"
            ></el-table-column>
            <el-table-column
              label="预计时间"
              width="120"
              align="right"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.estimatedTime || '未知' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchProductionLines,
  createProductionLine,
  updateProductionLine,
  deleteProductionLine,
} from "@/api/productionLine";
import { calculateSchedule } from "@/api/schedule";

export default {
  name: "LineOrder",
  components: {},
  props: {
    // 从父组件接收数据
    initialData: {
      type: Object,
      default: () => ({
        records: [],
        total: 0,
        availableEquipment: [],
        availableOrders: [],
      }),
    },
  },
  data() {
    return {
      tableKey: 0,
      list: [], // 产线列表
      total: 0, // 总记录数
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
      },
      temp: {
        line_id: null,
        line_manager: "",
        selectedOrders: [],
        equipment: [],
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑产线",
        create: "添加产线",
      },
      rules: {
        line_id: [
          { required: true, message: "产线ID是必填的", trigger: "blur" },
        ],
        line_manager: [
          { required: true, message: "产线负责人是必填的", trigger: "blur" },
        ],
      },
      availableEquipment: [], // 可用设备列表
      availableOrders: [], // 可用订单列表
      currentLineOrders: [],
      currentLineEquipment: [],

      // 调度相关数据
      scheduleDialogVisible: false,
      scheduleLoading: false,
      scheduleData: null,
      currentScheduleLine: null, // 当前正在调度的产线

      // 调度链详情相关
      selectedChain: null,
      chainDetailVisible: false,
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.listLoading = true;
      fetchProductionLines(this.listQuery)
        .then((response) => {
          this.list = response.data.records;
          this.total = response.data.total;
          // 更新可用设备和订单信息
          if (response.data.availableEquipment) {
            this.availableEquipment = response.data.availableEquipment;
          }
          if (response.data.availableOrders) {
            this.availableOrders = response.data.availableOrders;
          }
          this.listLoading = false;
        })
        .catch((error) => {
          console.error("获取产线数据失败:", error);
          this.listLoading = false;
        });
    },

    resetTemp() {
      this.temp = {
        line_id: null,
        line_manager: "",
        selectedOrders: [],
        equipment: [],
      };
      this.currentLineOrders = [];
      this.currentLineEquipment = [];
    },

    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },

    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          // 创建产线的基本数据
          const lineData = {
            lineId: this.temp.line_id,
            lineManager: this.temp.line_manager,
          };

          createProductionLine(lineData)
            .then((response) => {
              if (response.data && response.data.status === 200) {
                this.$notify({
                  title: "成功",
                  message: "创建产线成功",
                  type: "success",
                  duration: 2000,
                });

                // 关闭对话框并通知父组件刷新数据
                this.dialogFormVisible = false;
                this.fetchData(); // 刷新数据
              } else {
                this.$message.error(response.data.message || "创建产线失败");
              }
            })
            .catch((error) => {
              console.error("创建产线失败:", error);
              this.$message.error("创建产线失败");
            });
        }
      });
    },

    handleUpdate(row) {
      this.resetTemp();
      // 设置基本信息
      this.temp = {
        line_id: row.line_id,
        line_manager: row.line_manager,
        selectedOrders: row.orders
          ? row.orders.map((order) => order.order_id)
          : [],
        equipment: row.equipment
          ? row.equipment.map((item) => ({
              equipment_id: item.equipment_id,
              quantity: item.quantity,
            }))
          : [],
      };
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },

    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          // 更新产线基本信息
          const lineData = {
            lineId: this.temp.line_id,
            lineManager: this.temp.line_manager,
          };

          updateProductionLine(lineData)
            .then((response) => {
              if (response.data && response.data.status === 200) {
                this.$notify({
                  title: "成功",
                  message: "更新产线成功",
                  type: "success",
                  duration: 2000,
                });

                // 关闭对话框并通知父组件刷新数据
                this.dialogFormVisible = false;
                this.fetchData(); // 刷新数据
              } else {
                this.$message.error(response.data.message || "更新产线失败");
              }
            })
            .catch((error) => {
              console.error("更新产线失败:", error);
              this.$message.error("更新产线失败");
            });
        }
      });
    },

    handleDelete(row) {
      this.$confirm("确认删除此产线吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deleteProductionLine(row.line_id)
            .then((response) => {
              if (response.data && response.data.status === 200) {
                this.$notify({
                  title: "成功",
                  message: "删除成功",
                  type: "success",
                  duration: 2000,
                });

                // 刷新数据
                this.fetchData();
              } else {
                this.$message.error(response.data.message || "删除产线失败");
              }
            })
            .catch((error) => {
              console.error("删除产线失败:", error);
              this.$message.error("删除产线失败");
            });
        })
        .catch(() => {
          // 取消删除操作
        });
    },

    // 设备表单处理
    addEquipmentItem() {
      this.temp.equipment.push({
        equipment_id: null,
        quantity: 1,
      });
    },

    removeEquipmentItem(index) {
      this.temp.equipment.splice(index, 1);
    },

    handleEquipmentChange(index) {
      const item = this.temp.equipment[index];
      const equipment = this.availableEquipment.find(
        (e) => e.equipment_id === item.equipment_id
      );
      if (equipment) {
        const maxAvailable = this.getMaxQuantity(item);
        if (item.quantity > maxAvailable) {
          item.quantity = maxAvailable;
        }
      }
    },

    getAvailableQuantity(equipment, item) {
      // 计算可用数量，考虑当前正在编辑的设备项
      let usedQuantity = 0;

      // 考虑表单中已经选择的相同设备
      this.temp.equipment.forEach((e) => {
        if (e.equipment_id === equipment.equipment_id && e !== item) {
          usedQuantity += e.quantity;
        }
      });

      // 如果是编辑模式，需要考虑原始设备数量
      if (
        this.dialogStatus === "update" &&
        item.originalId === equipment.equipment_id
      ) {
        usedQuantity -= item.originalQuantity;
      }

      return (
        equipment.equipment_quantity_total -
        equipment.equipment_quantity_used +
        usedQuantity
      );
    },

    getMaxQuantity(item) {
      if (!item.equipment_id) return 1;
      const equipment = this.availableEquipment.find(
        (e) => e.equipment_id === item.equipment_id
      );
      if (!equipment) return 1;

      return this.getAvailableQuantity(equipment, item);
    },

    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.fetchData(); // 刷新数据
    },

    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.fetchData(); // 刷新数据
    },

    // 检查产线是否可以进行调度计算
    canSchedule(row) {
      return (
        row.orders &&
        row.orders.length > 0 &&
        row.equipment &&
        row.equipment.length > 0
      );
    },

    // 处理调度计算
    // 处理调度计算
    handleSchedule(row) {
      if (!this.canSchedule(row)) {
        this.$message.warning("该产线没有足够的订单或设备，无法进行调度计算");
        return;
      }

      this.currentScheduleLine = row;
      this.scheduleDialogVisible = true;
      this.scheduleLoading = true;
      this.scheduleData = null;
      this.selectedChain = null; // 清空选中的链

      // 显示详细的加载信息
      const loadingInstance = this.$loading({
        lock: true,
        text: "正在计算调度结果，请稍候...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });

      calculateSchedule(row.line_id).then((response) => {
        console.log("调度计算完整响应:", response);
        console.log("响应对象:", response);
        console.log("响应对象code:", response.code);
        console.log(
          "响应状态码:",
          response.data ? response.data.code : "无状态码"
        );
        console.log("响应数据:", response.data ? response.data.data : "无数据");
        this.scheduleLoading = false;
        loadingInstance.close();
      });
    },

    // 验证图片URL是否可用
    validateImageUrls() {
      if (!this.scheduleData) return;

      // 验证甘特图URL
      if (this.scheduleData.ganttChartUrl) {
        console.log("验证甘特图URL:", this.scheduleData.ganttChartUrl);
        const img = new Image();
        img.onload = () => console.log("甘特图加载成功!");
        img.onerror = (e) => {
          console.error("甘特图加载失败:", e);
          this.$message.warning("甘特图加载失败，请检查图片路径是否正确");
        };
        img.src = this.scheduleData.ganttChartUrl;
      }

      // 验证收敛曲线URL
      if (this.scheduleData.convergenceUrl) {
        console.log("验证收敛曲线URL:", this.scheduleData.convergenceUrl);
        const img = new Image();
        img.onload = () => console.log("收敛曲线加载成功!");
        img.onerror = (e) => {
          console.error("收敛曲线加载失败:", e);
          this.$message.warning("收敛曲线加载失败，请检查图片路径是否正确");
        };
        img.src = this.scheduleData.convergenceUrl;
      }
    },
  },
  extractChainTasks(chainInfo) {
    if (!chainInfo) return "";

    // 匹配像 "链 1: 产品A-任务1 -> 产品A-任务2 (开始: 0.00, 结束: 25.50)" 这样的格式
    const match = chainInfo.match(/链\s+\d+:\s+(.*?)\s+\(开始:/);
    if (match && match[1]) {
      return match[1]; // 返回任务序列部分
    }

    // 如果没有时间信息，直接返回完整信息
    if (chainInfo.indexOf("(开始:") === -1) {
      return chainInfo.replace(/^链\s+\d+:\s+/, "");
    }

    return chainInfo;
  },

  /**
   * 从链信息文本中提取时间信息
   * @param {string} chainInfo 链信息文本
   * @returns {Object|null} 包含开始时间和结束时间的对象，或者null
   */
  extractChainTimeInfo(chainInfo) {
    if (!chainInfo) return null;

    // 匹配像 "(开始: 0.00, 结束: 25.50)" 这样的格式
    const match = chainInfo.match(/\(开始:\s*([\d.]+),\s*结束:\s*([\d.]+)\)/);
    if (match && match[1] && match[2]) {
      return {
        startTime: parseFloat(match[1]),
        endTime: parseFloat(match[2]),
      };
    }

    return null;
  },

  /**
   * 计算链的持续时间
   * @param {Object} timeInfo 时间信息对象，包含startTime和endTime
   * @returns {string} 格式化的持续时间
   */
  calculateDuration(timeInfo) {
    if (
      !timeInfo ||
      typeof timeInfo.startTime !== "number" ||
      typeof timeInfo.endTime !== "number"
    ) {
      return "未知";
    }

    const duration = timeInfo.endTime - timeInfo.startTime;
    return duration.toFixed(2);
  },

  /**
   * 从所有调度链中提取任务列表
   * @returns {Array} 任务列表
   */
  extractTasksFromChains() {
    if (!this.scheduleData || !this.scheduleData.chains) {
      return [];
    }

    const tasks = [];
    this.scheduleData.chains.forEach((chain) => {
      const tasksText = this.extractChainTasks(chain.chainInfo);
      // 分割任务，考虑箭头分隔符
      const taskItems = tasksText.split(" -> ");

      taskItems.forEach((task, index) => {
        tasks.push({
          taskId: task.trim(),
          chainId: chain.chainId,
          sequence: index + 1,
          estimatedDuration: null, // 默认时间信息暂时为空，后续可增强
        });
      });
    });

    return tasks;
  },

  /**
   * 从链信息中提取任务详情
   * @param {Object} chain 链对象
   * @returns {Array} 任务详情列表
   */
  extractTaskDetails(chain) {
    if (!chain || !chain.chainInfo) {
      return [];
    }

    const tasksText = this.extractChainTasks(chain.chainInfo);
    const taskItems = tasksText.split(" -> ");

    return taskItems.map((task, index) => ({
      taskId: task.trim(),
      sequence: index + 1,
      estimatedTime: null, // 此处可以根据需要计算或添加任务预计时间
    }));
  },

  /**
   * 显示链详情对话框
   * @param {Object} chain 选中的链对象
   */
  showChainDetails(chain) {
    this.selectedChain = chain;
    this.chainDetailVisible = true;
  },

  /**
   * 修正图片URLs以确保前端可以正确访问
   * @param {Object} scheduleData 调度数据对象
   * @returns {Object} 修正后的调度数据
   */
  fixImageUrls(scheduleData) {
    if (!scheduleData) return null;

    // 创建副本以避免修改原对象
    const fixedData = { ...scheduleData };

    // 获取当前站点的origin，用于构建完整URL
    const origin = window.location.origin;

    // 修正甘特图URL
    if (fixedData.ganttChartUrl) {
      if (
        !fixedData.ganttChartUrl.startsWith("http") &&
        !fixedData.ganttChartUrl.startsWith(origin)
      ) {
        if (!fixedData.ganttChartUrl.startsWith("/")) {
          fixedData.ganttChartUrl = "/" + fixedData.ganttChartUrl;
        }
        // 添加origin前缀，确保使用绝对路径
        fixedData.ganttChartUrl = origin + fixedData.ganttChartUrl;
      }
    }

    // 修正收敛曲线URL
    if (fixedData.convergenceUrl) {
      if (
        !fixedData.convergenceUrl.startsWith("http") &&
        !fixedData.convergenceUrl.startsWith(origin)
      ) {
        if (!fixedData.convergenceUrl.startsWith("/")) {
          fixedData.convergenceUrl = "/" + fixedData.convergenceUrl;
        }
        // 添加origin前缀，确保使用绝对路径
        fixedData.convergenceUrl = origin + fixedData.convergenceUrl;
      }
    }

    return fixedData;
  },
};
</script>

<style scoped>
.filter-container {
  padding-bottom: 10px;
}
.equipment-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.gantt-container {
  margin-top: 20px;
  margin-bottom: 20px;
}
.gantt-chart {
  margin-top: 10px;
  min-height: 300px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
.gantt-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  color: #909399;
  font-size: 14px;
}
.no-schedule-data {
  text-align: center;
  padding: 50px 0;
  color: #909399;
}
.schedule-chains {
  margin-top: 20px;
}
</style>