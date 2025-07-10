# Understanding Neural Networks Through Kernel Machines

For my senior capstone at UCSD, I dove deep into the relationship between kernel machines and neural networks. This research helped me understand how these seemingly different approaches to machine learning are more connected than they first appear.

## The Research Question

Neural networks have achieved remarkable success, but their inner workings remain somewhat mysterious. Meanwhile, kernel methods have solid theoretical foundations but can be limited in practice. My research explored:

**Can kernel methods help us understand what neural networks learn and why they work so well?**

## Background: Two Paradigms

### Kernel Methods
Kernel methods transform data into high-dimensional spaces where linear methods can solve nonlinear problems:

$$K(x_i, x_j) = \phi(x_i)^T \phi(x_j)$$

Where $\phi$ maps inputs to a feature space, often infinite-dimensional.

### Neural Networks  
Neural networks learn hierarchical representations through multiple layers:

$$f(x) = W_L \sigma(W_{L-1} \sigma(...\sigma(W_1 x)...))$$

Where $\sigma$ is a nonlinear activation function.

## The Connection: Neural Tangent Kernel

Recent theoretical work has shown that infinitely wide neural networks behave like kernel machines, governed by the Neural Tangent Kernel (NTK):

$$\Theta(x, x') = \mathbb{E}[\nabla_\theta f_\theta(x) \nabla_\theta f_\theta(x')^T]$$

This was a key insight for my research - we could study finite neural networks by examining their relationship to this infinite-width limit.

## My Contributions

### 1. Empirical Analysis of Finite vs Infinite Width

I studied how real neural networks deviate from their infinite-width NTK behavior:

```python
def compute_ntk_similarity(model, X):
    """
    Compute similarity between finite network and its NTK
    """
    # Get gradients for NTK computation
    gradients = []
    for x in X:
        grad = torch.autograd.grad(model(x), model.parameters(), 
                                  create_graph=True)
        gradients.append(torch.cat([g.flatten() for g in grad]))
    
    # Compute empirical NTK
    ntk_matrix = torch.stack(gradients) @ torch.stack(gradients).T
    return ntk_matrix
```

**Key Finding**: Networks with 50-200 hidden units show significant deviation from NTK behavior, suggesting feature learning is crucial in practical regimes.

### 2. Feature Learning vs Lazy Training

I distinguished between two training regimes:
- **Lazy Training**: Network weights barely change, behaves like NTK
- **Feature Learning**: Network actively changes its representations

The transition depends on:
- Network width
- Learning rate  
- Initialization scale
- Data complexity

### 3. Understanding Generalization

Using kernel perspective helped explain generalization:

$$\text{Generalization Error} \approx \frac{\text{tr}(K^{-1})}{n} + \text{bias}$$

Where $K$ is the kernel matrix and $n$ is the sample size.

## Experimental Results

### MNIST Experiments
- **Narrow networks** (width < 100): Strong feature learning, good generalization
- **Wide networks** (width > 1000): Lazy training, memorization tendencies
- **Medium networks**: Sweet spot balancing feature learning and stability

### Synthetic Data Analysis  
Created datasets where we could control:
- Intrinsic dimensionality
- Noise level
- Task complexity

This allowed us to test theoretical predictions about when each regime dominates.

## Implications

### For Practitioners
1. **Network Width Matters**: Not always "bigger is better"
2. **Initialization is Critical**: Affects which training regime you enter
3. **Learning Rate Tuning**: Can push networks between regimes

### For Theorists
1. **Finite-width Effects**: Need better theory for practical networks
2. **Feature Learning Dynamics**: Understanding what representations emerge
3. **Optimization Landscape**: How kernel perspective informs training

## Code and Reproducibility

I made all experimental code available, including:

```python
# Main analysis framework
class NetworkKernelAnalysis:
    def __init__(self, model, data_loader):
        self.model = model
        self.data_loader = data_loader
    
    def compute_feature_learning_score(self):
        """Measure how much features change during training"""
        initial_features = self.get_features()
        # ... training loop ...
        final_features = self.get_features()
        
        return cosine_similarity(initial_features, final_features)
    
    def analyze_generalization_bound(self):
        """Compute kernel-based generalization bound"""
        K = self.compute_kernel_matrix()
        trace_term = torch.trace(torch.inverse(K + 1e-6 * torch.eye(K.size(0))))
        return trace_term / K.size(0)
```

## Future Directions

This research opened several questions:

1. **Adaptive Width**: Can we dynamically adjust network width during training?
2. **Kernel Design**: What kernels best approximate real neural network behavior?
3. **Beyond Vision**: How do these insights apply to NLP and other domains?

## Publication and Impact

The work resulted in:
- [Conference paper](https://arxiv.org/abs/2303.15745) at a major ML venue
- Open-source analysis toolkit
- Follow-up collaborations with kernel method researchers

## Personal Reflection

This research taught me that understanding comes from connecting different perspectives. Neural networks and kernel methods seemed unrelated initially, but exploring their connections revealed deep insights about both.

The theoretical framework also improved my intuition for practical deep learning - I now think more carefully about network width, initialization, and the feature learning vs memorization trade-off.

Most importantly, it showed me how mathematical theory can guide practical machine learning, making me a better both researcher and practitioner.