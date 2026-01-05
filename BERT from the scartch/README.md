# BERT Pre-training: Lý Thuyết MLM + NSP

## Tổng quan

BERT (Bidirectional Encoder Representations from Transformers) là một mô hình pre-training được Google phát triển vào năm 2018. Điểm đặc biệt của BERT là sử dụng **2 objectives kết hợp** trong quá trình pre-training:

1. **MLM (Masked Language Modeling)**: Dự đoán từ bị che
2. **NSP (Next Sentence Prediction)**: Dự đoán câu tiếp theo

## 1. Kiến trúc BERT

### 1.1. Transformer Encoder

BERT sử dụng kiến trúc **Transformer Encoder** (chỉ encoder, không có decoder):

- **Input Embedding**: Kết hợp 3 loại embedding
  - Token Embedding: Embedding cho từng token
  - Position Embedding: Embedding cho vị trí trong câu
  - Segment Embedding: Embedding để phân biệt câu 1 và câu 2 (cho NSP)

- **Multi-Head Self-Attention**: Cho phép mô hình nhìn cả 2 phía (bidirectional)

- **Feed Forward Network**: Xử lý thông tin sau attention

- **Layer Normalization & Residual Connection**: Giúp training ổn định

### 1.2. Special Tokens

BERT sử dụng các special tokens:

- `[CLS]`: Token đặc biệt ở đầu câu, dùng cho classification tasks
- `[SEP]`: Phân tách giữa 2 câu (cho NSP)
- `[MASK]`: Token để thay thế từ bị mask (cho MLM)
- `[PAD]`: Padding token
- `[UNK]`: Unknown token

## 2. Masked Language Modeling (MLM)

### 2.1. Mục đích

MLM giúp BERT học hiểu ngữ nghĩa của từ trong ngữ cảnh. Thay vì dự đoán từ tiếp theo như GPT (unidirectional), BERT có thể nhìn cả 2 phía để hiểu từ.

### 2.2. Cách hoạt động

1. **Chọn 15% tokens** để mask
2. Trong số 15% đó:
   - **80%**: Thay bằng `[MASK]` token
   - **10%**: Thay bằng token ngẫu nhiên
   - **10%**: Giữ nguyên (không thay đổi)

3. Model phải dự đoán từ gốc cho các vị trí bị mask

### 2.3. Tại sao không mask 100%?

- **80% [MASK]**: Model học dự đoán từ bị che
- **10% random**: Model không quá phụ thuộc vào `[MASK]` token
- **10% giữ nguyên**: Model vẫn học từ trong ngữ cảnh thực tế

### 2.4. Loss Function

```
MLM Loss = CrossEntropy(predicted_token, original_token)
```

Chỉ tính loss cho các vị trí bị mask (ignore các vị trí khác).

## 3. Next Sentence Prediction (NSP)

### 3.1. Mục đích

NSP giúp BERT hiểu quan hệ giữa các câu, rất quan trọng cho các tasks như:
- Question Answering
- Natural Language Inference
- Text Summarization

### 3.2. Cách hoạt động

1. **Tạo cặp câu**:
   - **50%**: Câu tiếp theo (IsNext = 1)
     - Lấy 2 câu liên tiếp trong document
   - **50%**: Câu ngẫu nhiên (IsNext = 0)
     - Lấy 2 câu không liên quan

2. **Format input**:
   ```
   [CLS] Câu 1 [SEP] Câu 2 [SEP]
   ```
   - Segment IDs: `0` cho câu 1, `1` cho câu 2

3. **Dự đoán**: Sử dụng `[CLS]` token để dự đoán IsNext/NotNext

### 3.3. Loss Function

```
NSP Loss = CrossEntropy(predicted_label, true_label)
```

Binary classification: IsNext (1) hoặc NotNext (0).

## 4. Kết hợp MLM + NSP

### 4.1. Pre-training Process

Trong mỗi training step:

1. **Tạo input**: 
   - Tạo cặp câu cho NSP
   - Áp dụng MLM masking lên cặp câu đó

2. **Forward pass**:
   - BERT encoder xử lý input
   - MLM head: Dự đoán từ bị mask cho tất cả vị trí
   - NSP head: Dự đoán IsNext/NotNext từ `[CLS]` token

3. **Loss calculation**:
   ```
   Total Loss = MLM Loss + NSP Loss
   ```

4. **Backward pass**: Update weights cho cả 2 objectives

### 4.2. Tại sao kết hợp?

- **MLM**: Giúp model hiểu ngữ nghĩa từ (word-level understanding)
- **NSP**: Giúp model hiểu quan hệ câu (sentence-level understanding)
- **Kết hợp**: Model học được cả 2 cấp độ, tạo ra representations mạnh mẽ

### 4.3. Shared Encoder

Cả MLM và NSP đều dùng chung BERT encoder, giúp:
- Representations học được từ cả 2 tasks
- Model hiểu cả từ và câu
- Hiệu quả hơn so với train riêng lẻ

## 5. Pre-training vs Fine-tuning

### 5.1. Pre-training

- **Mục đích**: Học general language representations
- **Data**: Large unlabeled corpus (Wikipedia, BooksCorpus)
- **Tasks**: MLM + NSP
- **Output**: Pre-trained BERT model

### 5.2. Fine-tuning

- **Mục đích**: Adapt model cho specific task
- **Data**: Labeled data cho task cụ thể
- **Tasks**: Classification, QA, NLI, etc.
- **Method**: 
  - Giữ nguyên BERT encoder
  - Thêm task-specific head
  - Fine-tune toàn bộ model với learning rate nhỏ

## 6. Ưu điểm của BERT

1. **Bidirectional**: Nhìn cả 2 phía, hiểu context tốt hơn
2. **Transfer Learning**: Pre-train một lần, fine-tune cho nhiều tasks
3. **State-of-the-art**: Đạt kết quả tốt trên nhiều NLP benchmarks
4. **Versatile**: Có thể áp dụng cho nhiều tasks khác nhau

## 7. Hạn chế

1. **NSP không hiệu quả**: Nhiều nghiên cứu sau này cho thấy NSP không đóng góp nhiều
2. **Computational cost**: Pre-training tốn nhiều tài nguyên
3. **Max sequence length**: Giới hạn 512 tokens
4. **Masking strategy**: Chỉ mask 15% tokens, không tận dụng hết data

## 8. Các biến thể sau BERT

- **RoBERTa**: Bỏ NSP, cải thiện MLM
- **ALBERT**: Giảm parameters bằng cách share weights
- **DistilBERT**: Model nhỏ hơn, nhanh hơn
- **ELECTRA**: Thay MLM bằng replaced token detection

## 9. Tóm tắt

BERT pre-training sử dụng **2 objectives kết hợp**:

- **MLM**: Học hiểu từ trong ngữ cảnh (word-level)
- **NSP**: Học quan hệ giữa câu (sentence-level)

**Total Loss = MLM Loss + NSP Loss**

Cả 2 được train **cùng lúc** trong một forward pass, giúp BERT học được representations mạnh mẽ cho nhiều downstream tasks.

## Tài liệu tham khảo

- [BERT Paper](https://arxiv.org/abs/1810.04805): Devlin et al., 2018
- [The Illustrated BERT](http://jalammar.github.io/illustrated-bert/): Blog post giải thích BERT
- [BERT Explained](https://towardsdatascience.com/bert-explained-state-of-the-art-language-model-for-nlp-f8b21a9b6270): Medium article

